/* eslint-disable no-unused-vars */
import express, { Request, Response } from 'express';
import cors from 'cors';
import rootRouter from './rootRoute/router';
import fetchCallDataRouter from './fetchCallData/router';

require('dotenv').config();

const server = express();

server
  .use(cors())
  .use(express.json()) // populates req.body
  .use(rootRouter)
  .use(fetchCallDataRouter);

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Express server running & listening on port ${process.env.SERVER_PORT}`);
});
