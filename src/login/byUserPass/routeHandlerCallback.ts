import { Client as PgClient } from 'pg';
import { Request, Response } from 'express';
import CampaignStatus from '../../shared/CampaignStatus';

const getUserCampaignDataQuery = `SELECT name, number, status
FROM app_user

LEFT JOIN campaign
ON app_user.id = campaign.app_user_id

WHERE app_user.id = $1::text
`;

interface JoinedUserCampaign {
  name: string,
  number: string,
  status: CampaignStatus
}

/*
  get all campaign data for this account
  req now has req.user
*/
async function getCampaignData(req: Request, res: Response) {
  const pgClient = new PgClient();
  try {
    await pgClient.connect();
  } catch (error) {
    throw new Error(error);
  }
}

export default getCampaignData;
