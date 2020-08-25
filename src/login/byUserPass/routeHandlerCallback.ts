import { Client as PgClient } from 'pg';
import { Request, Response } from 'express';
import ECampaignStatus from '../../shared/ECampaignStatus';

const getUserCampaignDataQuery = `SELECT name, number, status
FROM app_user

LEFT JOIN campaign
ON app_user.id = campaign.app_user_id

WHERE CAST(app_user.id as TEXT) = CAST($1 as TEXT);
`;

interface UserShape {
  id: string,
  user_name: string,
}

/*
  Authentication has already passed. req.user is populated
  Send back req.user
*/
async function respondWithUserData(req: Request, res: Response) {
  const userData = req.user as UserShape;

  res.json(userData);
}

export default respondWithUserData;
