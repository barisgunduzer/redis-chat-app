import 'dotenv/config';
import { createClient } from 'redis';

const endpoint = process.env.REDIS_ENDPOINT_URL;
const password = process.env.REDIS_PASSWORD || null;

export const redisClient = createClient({ url: endpoint });

export const subscriber = createClient({
  url: endpoint,
  password: password,
});

export const connectRedis = async () => {
  try {
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
  } catch (error) {
    console.log(error);
  }
};

const auth = async () => {
  if (password === null) {
    return;
  } else {
    redisClient.auth({ password });
  }
};

export const authRedis = async () => {
  await auth(redisClient);
  await auth(subscriber);
};
