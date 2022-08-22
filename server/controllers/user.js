import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../configs/redis.js';
import { makeUsernameKey } from '../utils/redis.js';

export const getAccessToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

export async function getActiveUser(req, res) {
  if (req.session.user) {
    const { id, username } = req.session.user;
    res.status(200).json({ id, username });
  } else {
    res.status(200).json(null);
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;
  const user = await redisClient.hGetAll(`user:${id}`);
  const { username } = user;
  return res.send({ id, username });
}

/** Retrieve the user info based on ids sent */
export async function getUsersByIds(req, res) {
  /** @type {string[]} */ const ids = req.query.ids;
  if (typeof ids === 'object' && Array.isArray(ids)) {
    const users = {};
    for (const id of ids) {
      const user = await redisClient.hGetAll(`user:${id}`);
      users[id] = {
        id: id,
        username: user.username,
        online: !!(await redisClient.sIsMember('online_users', id)),
      };
    }
    return res.send(users);
  }
  return res.sendStatus(404);
}

export async function getOnlineUsers(req, res) {
  const onlineIds = await redisClient.sMembers(`online_users`);
  const users = {};

  for (const onlineId of onlineIds) {
    const user = await redisClient.hGetAll(`user:${onlineId}`);
    users[onlineId] = {
      id: onlineId,
      username: user.username,
      online: true,
    };
  }
  return res.send(users);
}

export async function registerUser(req, res) {
  const { username, password } = req.body;

  if (!(username && password)) {
    res.status(400).send('All inputs are required');
  }

  const usernameKey = makeUsernameKey(username);
  const isUserExists = await redisClient.exists(usernameKey);

  if (isUserExists) {
    res.status(400).json({ error: 'User already exists' });
  } else {
    const { userId, username } = await createUser(username, password);
    const token = getAccessToken(userKey, username);

    const user = {
      id: userId,
      username: username,
      token: token,
    };

    req.session.user = user;
    res.status(201).json(user);
  }
}

export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      res.status(400).send('Username or password cannot be empty');
    }

    const usernameKey = makeUsernameKey(username);
    const isUserExists = await redisClient.exists(usernameKey);

    if (isUserExists) {
      const userKey = await redisClient.get(usernameKey);
      const userData = await redisClient.hGetAll(userKey);
      const userId = userKey.split(':').pop();

      if (await bcrypt.compare(password, userData.password)) {
        const user = {
          id: userId,
          username: username,
          token: getAccessToken(userId, username),
        };

        req.session.user = user;

        return res.status(200).json(user);
      } else {
        return res.status(401).send('Incorrect password');
      }
    } else {
      return res.status(400).send('User does not exist');
    }
  } catch (err) {
    console.log(err);
  }
}

export async function logoutUser(req, res) {
  req.session.destroy(() => {});
  return res.sendStatus(200);
}
