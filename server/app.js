import ip from 'ip';
import 'dotenv/config';
import createDemoData from './helpers/demo.js';

import {
  redisClient,
  subscriber,
  authRedis,
  connectRedis,
} from './configs/redis.js';

import path from 'path';
import express from 'express';

import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './configs/swagger.js';

import indexRouter from './routes/v1/index.js';
import userRouter from './routes/v1/user.js';
import roomRouter from './routes/v1/room.js';

import { sanitise } from './utils/string.js';
import { getTotalUser, setTotalUser } from './utils/redis.js';
import sessionMiddleware from './middlewares/session.js';

const IP = ip.address();
const PORT = process.env.API_PORT || 4000;
const SERVER_ID = `${IP}:${PORT}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use('/', express.static(__dirname + '/client/build'));

app.use(express.json());
app.use(sessionMiddleware);

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/rooms', roomRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const publish = async (type, data) => {
  const outgoing = {
    serverId: SERVER_ID,
    type,
    data,
  };
  await redisClient.publish('MESSAGES', JSON.stringify(outgoing));
};

const initPubSub = async () => {
  /** We don't use channels here, since the contained message contains all the necessary data. */
  subscriber.on('message', (_, message) => {
    /**
     * @type {{
     *   serverId: string;
     *   type: string;
     *   data: object;
     * }}
     **/
    const { serverId, type, data } = JSON.parse(message);
    /* We don't handle the pub/sub messages if the server is the same */
    if (serverId === SERVER_ID) {
      return;
    }
    io.emit(type, data);
  });
  await subscriber.subscribe('MESSAGES');
};

const initializeSocketEvents = async () => {
  io.on('connection', async (socket) => {
    const { session } = socket.request;

    if (session.user === undefined) {
      return;
    }

    await redisClient.sAdd('online_users', `${session.user.id}`);

    const msg = {
      ...session.user,
      online: true,
    };

    await publish('user.connected', msg);

    socket.broadcast.emit('user.connected', msg);

    socket.on('room.join', (id) => {
      socket.join(`room:${id}`);
    });

    socket.on(
      'message',
      /**
       * @param {{
       *  from: string
       *  date: number
       *  message: string
       *  roomId: string
       * }} message
       **/
      async (message) => {
        /** Make sure nothing illegal is sent here. */
        message = { ...message, message: sanitise(message.message) };

        /**
         * The user might be set as offline if he tried to access the chat from another tab, pinging by message
         * resets the user online status
         */
        await redisClient.sAdd('online_users', `${message.from}`);

        /** We've got a new message. Store it in db, then send back to the room. */
        const messageString = JSON.stringify(message);
        const roomKey = `room:${message.roomId}`;

        /**
         * It may be possible that the room is private and new, so it won't be shown on the other
         * user's screen, check if the roomKey exist. If not then broadcast message that the room is appeared
         */
        const isPrivate = !(await redisClient.exists(`${roomKey}:name`));
        const roomHasMessages = await redisClient.exists(roomKey);

        if (isPrivate && !roomHasMessages) {
          const ids = message.roomId.split(':');
          const msg = {
            id: message.roomId,
            names: [
              await redisClient.hmGet(`user:${ids[0]}`, 'username'),
              await redisClient.hmGet(`user:${ids[1]}`, 'username'),
            ],
          };
          await publish('show.room', msg);
          socket.broadcast.emit(`show.room`, msg);
        }

        await redisClient.zAdd(roomKey, {
          score: message.date,
          value: messageString,
        });

        await publish('message', message);

        io.to(roomKey).emit('message', message);
      },
    );

    socket.on('disconnect', async () => {
      const { session } = socket.request;
      await redisClient.sRem('online_users', `${session.user.id}`);
      const msg = {
        ...session.user,
        online: false,
      };

      await publish('user.disconnected', msg);

      socket.broadcast.emit('user.disconnected', msg);
    });
  });
};

const initializeApp = async () => {
  await authRedis();
  await connectRedis();
  await setTotalUser();
  await initializeSocketEvents();
};

server.listen(+PORT, async () => {
  try {
    await initializeApp();
    if (process.env.NODE_ENV === 'development') {
      console.log('In development mode');
      console.log('Server started on port', PORT);
      const totalUser = await getTotalUser();
      if (totalUser === '0') {
        await createDemoData();
        await initPubSub();
      }
    }
  } catch (error) {
    console.log(error);
  }
});
