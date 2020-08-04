// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import { Client as PGClient } from 'pg';
import { queryAllNumbersForCampaignData } from './queryAllNumbers';

// query each phone number for a record
// enhance original record with aggregate data

// reshuffle the same records to be in an array
// this should be done during the first api call
// break it out to another function, an aggregate function

async function fetchAllCampaignDataForOneUser(req: Request, res: Response) {
  const { userName } = req.body;
  const postgres = new PGClient();
  try {
    await postgres.connect();
    const response = await postgres.query(queryAllNumbersForCampaignData(userName));
    if (response.ok) {
      res.json(response.json());
    }

    throw new Error('incomplete response during queryAllNumbersForCampaignData()');
  } catch (error) {
    throw new Error(error.stack);
  }
}

const router = Router();
router.post('/campaigns', fetchAllCampaignDataForOneUser);

export default router;
