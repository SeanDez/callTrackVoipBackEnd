/* eslint-disable no-unused-vars */
import { Router, Request, Response } from 'express';

const router = Router();

// query each phone number for a record
// enhance original record with aggregate data

// reshuffle the same records to be in an array
// this should be done during the first api call
// break it out to another function, an aggregate function

function matchRecord(req: Request, res: Response) {
  res.json();
}

router.get('/enhanceCallData', (req: Request, res: Response) => matchRecord(req, res));

export default router;
