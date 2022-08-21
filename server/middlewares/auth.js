import 'dotenv/config';
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const bearer =
    req.body.token || req.query.token || req.headers['authorization'];

  if (!bearer) {
    return res.status(403).send('A token is required for authorization');
  }

  const token = bearer.split(' ')[1];

  try {
    const { id, username } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.session.user = { id, username };

    if (!req.session.user) {
      return res.status(403).send('No active session found');
    }
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }

  return next();
};
