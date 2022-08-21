// @ts-check
import moment from 'moment';
import { redisClient } from '../configs/redis.js';
import {
  getPrivateRoomId,
  createPrivateRoom,
  createUser,
} from '../utils/redis.js';

/** Creating demo data */
const demoUsers = ['Ahmet', 'Buğra', 'Ayşe', 'Nazlı'];

const demoPassword = 'password123';

const greetings = ['Selam', 'Merhaba', 'Naber', 'Nasılsın'];

const messages = [
  'Naber millet!',
  'Selamlar herkese nasılsınız? Bir sonraki görüşmemiz ne zaman acaba?',
  'Herşey yolunda!',
  "Bir sonraki görüşmemiz öğlen saat 10:00'da olacak",
  `Teşekkürler!`,
];

const addMessage = async (
  /** @type {string | null} */ roomId,
  /** @type {number} */ fromId,
  /** @type {string} */ content,
  timestamp = moment().unix(),
) => {
  const roomKey = `room:${roomId}`;

  const message = {
    from: fromId,
    date: timestamp,
    message: content,
    roomId,
  };

  /** Now the other user sends the greeting to the user */
  await redisClient.zAdd(roomKey, {
    score: message.date,
    value: JSON.stringify(message),
  });
};

const createDemoData = async () => {
  /** For each name create a user. */
  const users = [];

  for (const demoUser of demoUsers) {
    const user = await createUser(demoUser, demoPassword);
    /** This one should go to the session */
    users.push(user);
  }

  const rooms = {};

  const getGreeting = () =>
    greetings[Math.floor(Math.random() * greetings.length)];

  const timestamp = () => moment().unix() - Math.random() * 222;

  for (const user of users) {
    const otherUsers = users.filter((x) => x.id !== user.id);

    for (const otherUser of otherUsers) {
      let privateRoomId = getPrivateRoomId(user.id, otherUser.id);
      let room = rooms[privateRoomId];

      if (room === undefined) {
        const res = await createPrivateRoom(user.id, otherUser.id);
        room = res[0];
        rooms[privateRoomId] = room;
      }

      await addMessage(privateRoomId, otherUser.id, getGreeting(), timestamp());
    }
  }

  const randomUserId = () => users[Math.floor(users.length * Math.random())].id;

  for (const [messageIndex, message] of messages.entries()) {
    let timestamp = moment().unix() - (messages.length - messageIndex) * 200;
    await addMessage('0', randomUserId(), message, timestamp);
  }

  console.log('Default users and messages were created');
};

export default createDemoData;
