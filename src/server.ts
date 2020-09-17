// eslint-disable-next-line no-unused-vars
import express, { Request, Response } from 'express';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { Client as PgClient } from 'pg';
import userPassLoginRouter from './login/byUserPass/router';
import registerUserRouter from './registerNewUser/router';
import accountDataRouter from './fetchAccountData/router';
import passportLocalStrategy from './passport/setupLocalStrategy';

import rootRouter from './rootRoute/router';
import captureCallData from './captureCallData/router';

require('dotenv').config();

const server = express();

// called to set a cookie initially
passport.serializeUser((user: any, callback) => {
  callback(null, user.id as string);
});

// called every time a request is made
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

const expressSessionOptions = { 
  secret: process.env.SESSION_SECRET!,
  resave: true,
};

server
  .use(cors())
  .use(express.json()) // populates req.body
  .use(cookieParser())
  .use(expressSession(expressSessionOptions))
  .use(passport.initialize())
  .use(passport.session())
  .use(rootRouter)
  .use(registerUserRouter)
  .use(accountDataRouter)
  .use(userPassLoginRouter)
  .use(captureCallData);

console.log(`updated on ${new Date()}`);

server.listen(process.env.SERVER_PORT, () => {
  /* eslint-disable no-console */
  console.log(`Express server running & listening on port ${process.env.SERVER_PORT}`);
});
