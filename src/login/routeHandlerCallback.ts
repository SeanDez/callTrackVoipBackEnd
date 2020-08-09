// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';

function sendLoginDetails(req: Request, res: Response) {
  const { username } = req.user;

  
}

export default sendLoginDetails;
