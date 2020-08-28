// eslint-disable-next-line no-unused-vars
import express, { Request, Response } from 'express';
import expressSession from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { Client as PgClient } from 'pg';
import userPassLoginRouter from './login/byUserPass/router';

import rootRouter from './rootRoute/router';
import fetchCallDataRouter from './captureCallData/router';

require('dotenv').config();

const server = express();

// passport.serializeUser(function(user, cb) {
//   cb(null, user.id);
// });

// passport.deserializeUser(function(id, cb) {
//   db.users.findById(id, function (err, user) {
//     if (err) { return cb(err); }
//     cb(null, user);
//   });
// });

passport.serializeUser((user: any, callback) => {
  callback(null, user.id as string);
});

passport.deserializeUser(async (userId: string, callback) => {
  const pgClient = new PgClient();
  try {
    pgClient.connect();
    const userRecord = (await pgClient.query('SELECT * FROM app_user WHERE CAST(id as text) = CAST($1 as text)', [userId])).rows[0];
    pgClient.end();
    callback(null, userRecord);
  } catch (error) {
    callback(error);
  }
});

server
  .use(cors())
  .use(express.json()) // populates req.body
  .use(expressSession({ secret: process.env.SESSION_SECRET! }))
  .use(passport.initialize())
  .use(passport.session())
  .use(rootRouter)
  .use(fetchCallDataRouter)
  .use(userPassLoginRouter);

console.log(`updated on ${new Date()}`);

server.listen(process.env.SERVER_PORT, () => {
  /* eslint-disable no-console */
  console.log(`Express server running & listening on port ${process.env.SERVER_PORT}`);
});
