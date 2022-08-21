import { redisClient } from './../configs/redis.js';

const DEFAULT_EXPIRATION = 3600;

/**
 *
 * @param {string} key - The key to store the data under
 * @param {Promise} cb - The function to call if the data is not in the cache
 *
 */

export const getOrSetCache = async (key, cb) => {
  try {
    const data = await redisClient.get(key);
    if (data !== null) return JSON.parse(data);
    const freshData = await cb();
    redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    return res.status(401).send('Something went wrong');
  }
};

export default getOrSetCache;
