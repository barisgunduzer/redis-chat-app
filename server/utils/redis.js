import bcrypt from 'bcrypt';
import { convertValidUsername } from '../utils/string.js';
import { redisClient } from './../configs/redis.js';

/** Redis key for the username (for getting the user id) */
export const makeUsernameKey = (username) => {
  const usernameKey = `username:${convertValidUsername(username)}`;
  return usernameKey;
};

export const createPrivateRoom = async (user1, user2) => {
  const roomId = getPrivateRoomId(user1, user2);

  if (roomId === null) {
    return [null, true];
  }

  /** Add rooms to those users */
  await redisClient.sAdd(`user:${user1}:rooms`, `${roomId}`);
  await redisClient.sAdd(`user:${user2}:rooms`, `${roomId}`);

  return [
    {
      id: roomId,
      names: [
        await redisClient.hmGet(`user:${user1}`, 'username'),
        await redisClient.hmGet(`user:${user2}`, 'username'),
      ],
    },
    false,
  ];
};

export const getMessages = async (roomId = '0', offset = 0, size = 50) => {
  /**
   * Logic:
   * 1. Check if room with id exists
   * 2. Fetch messages from last hour
   **/
  const roomKey = `room:${roomId}`;
  const roomExists = await redisClient.exists(roomKey);
  if (!roomExists) {
    return [];
  } else {
    const messages = (
      await redisClient.zRange(roomKey, offset, offset + size)
    ).reverse();
    return messages.map((message) => JSON.parse(message));
  }
};

export const getTotalUser = async () => {
  return await redisClient.get('total_users');
};

export const setTotalUser = async () => {
  /** We store a counter for the total users and increment it on each register */
  const totalUsersKeyExist = await redisClient.exists('total_users');

  if (!totalUsersKeyExist) {
    /** This counter is used for the id */
    await redisClient.set('total_users', 0);

    /**
     * Some rooms have pre-defined names. When the clients attempts to fetch a room, an additional lookup
     * is handled to resolve the name.
     * Rooms with private messages don't have a name
     */
    await redisClient.set(`room:${0}:name`, 'General');
  }
};

/**
 * Creates a user and adds default chat rooms
 * @param {string} username
 * @param {string} password
 */
export const createUser = async (username, password) => {
  const usernameKey = makeUsernameKey(username);
  /** Create user */
  const hashedPassword = await bcrypt.hash(password, 10);
  const nextId = await redisClient.incr('total_users');
  const userKey = `user:${nextId}`;
  await redisClient.set(usernameKey, userKey);
  await redisClient.hSet(userKey, [
    'username',
    username,
    'password',
    hashedPassword,
  ]);

  /**
   * Each user has a set of rooms he is in
   * let's define the default ones
   */
  await redisClient.sAdd(`user:${nextId}:rooms`, `${0}`); // Main room

  /** This one should go to the session */
  return { id: nextId, username };
};

export const getPrivateRoomId = (user1, user2) => {
  if (isNaN(user1) || isNaN(user2) || user1 === user2) {
    return null;
  }
  const minUserId = user1 > user2 ? user2 : user1;
  const maxUserId = user1 > user2 ? user1 : user2;
  return `${minUserId}:${maxUserId}`;
};
