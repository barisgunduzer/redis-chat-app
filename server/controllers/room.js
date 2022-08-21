import { redisClient } from '../configs/redis.js';
import { getPrivateRoomId, getMessages } from '../utils/redis.js';

export async function createPrivateRoom(req, res) {
  const { user1, user2 } = {
    user1: parseInt(req.body.user1),
    user2: parseInt(req.body.user2),
  };

  const roomId = getPrivateRoomId(user1, user2);

  if (roomId === null) {
    return [null, true];
  }

  /** Add rooms to those users */
  await redisClient.sAdd(`user:${user1}:rooms`, `${roomId}`);
  await redisClient.sAdd(`user:${user2}:rooms`, `${roomId}`);

  const [result, hasError] = [
    {
      id: roomId,
      names: [
        await redisClient.hmGet(`user:${user1}`, 'username'),
        await redisClient.hmGet(`user:${user2}`, 'username'),
      ],
    },
    false,
  ];

  if (hasError) {
    return res.sendStatus(400);
  }

  return res.status(201).send(result);
}

export async function getGeneralMessages(req, res) {
  const roomId = '0';
  try {
    let name = await redisClient.get(`room:${roomId}:name`);
    const messages = await getMessages(roomId, 0, 20);
    return res.status(200).send({ id: roomId, name, messages });
  } catch (err) {
    return res.status(400).send(err);
  }
}

export async function getRoomsByUserId(req, res) {
  const userId = req.params.userId;
  /** We got the room ids */
  const roomIds = await redisClient.sMembers(`user:${userId}:rooms`);
  const rooms = [];
  for (let x = 0; x < roomIds.length; x++) {
    const roomId = roomIds[x];
    let name = await redisClient.get(`room:${roomId}:name`);
    /** It's a room without a name, likey the one with private messages */
    if (!name) {
      /**
       * Make sure we don't add private rooms with empty messages
       * It's okay to add custom (named rooms)
       */
      const roomExists = await redisClient.exists(`room:${roomId}`);
      if (!roomExists) {
        continue;
      }
      const userIds = roomId.split(':');
      if (userIds.length !== 2) {
        return res.sendStatus(400);
      }
      rooms.push({
        id: roomId,
        names: [
          await redisClient.hmGet(`user:${userIds[0]}`, 'username'),
          await redisClient.hmGet(`user:${userIds[1]}`, 'username'),
        ],
      });
    } else {
      rooms.push({ id: roomId, names: [name] });
    }
  }
  res.status(200).send(rooms);
}

export async function getRoomMessages(req, res) {
  const roomId = req.params.id;
  const offset = +req.query.offset;
  const size = +req.query.size;
  try {
    const messages = await getMessages(roomId, offset, size);
    return res.status(200).send(messages);
  } catch (err) {
    return res.status(400).send(err);
  }
}
