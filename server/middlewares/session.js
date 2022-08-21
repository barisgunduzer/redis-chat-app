import session from 'express-session';
// import { redisClient } from './../configs/redis.js';
// import connectRedis from 'connect-redis';

// const RedisStore = connectRedis(session);

// TODO: In memory session storage will be replace with redis store.

const sessionMiddleware = session({
  // store: new RedisStore({ client: redisClient }),
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // if true only transmit cookie over https
    httpOnly: false, // if true prevent client side JS from reading the cookie
  },
});

export default sessionMiddleware;
