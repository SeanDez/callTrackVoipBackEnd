// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { Client as PGClient } from 'pg';
import queryAllNumbersForCampaignData from './queryAllNumbers';

interface QueryResultShape {
  'number.number': string,
  'campaign.name': string,
  'campaign.status': string
}

async function fetchAllCampaignDataForOneUser(req: Request, res: Response) {
  const { userName } = req.body;
  const postgres = new PGClient();
  try {
    await postgres.connect();
    const result = await postgres.query(queryAllNumbersForCampaignData(userName));
    postgres.end();

    const queryData = (result.rows as Array<QueryResultShape>);
    res.json(queryData);

    throw new Error('incomplete response during queryAllNumbersForCampaignData()');
  } catch (error) {
    throw new Error(error.stack);
  }
}

export default fetchAllCampaignDataForOneUser;
