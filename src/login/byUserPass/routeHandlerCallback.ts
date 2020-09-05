import { Client as PgClient } from 'pg';
import { Request, Response } from 'express';
import ECampaignStatus from '../../shared/ECampaignStatus';

interface AppUser {
  id: string;
  user_name: string;
  voipms_user_email: string;
  voipms_password_encrypted: string;
}

/*
  Authentication has already passed. req.user is populated
  Send back req.user
*/
async function respondWithUserData(req: Request, res: Response) {
  const userData = req.user as AppUser;

  res.json(userData);
}

export default respondWithUserData;
