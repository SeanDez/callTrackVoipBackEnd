import express, { Request, Response } from 'express';
import cors from 'cors';

require('dotenv').config();

const server = express();

server.use(cors());

server.get('/', (req: Request, res: Response) => {
  const instructToChoseProperRoute = 'You are on the root endpoint. Please use the full path to receive a more useful request';
  
  console.log(instructToChoseProperRoute);
  res.status(200).json({ message: instructToChoseProperRoute });
});

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Express server running & listing on port ${process.env.SERVER_PORT}`);
})



