import { Router, Response } from 'express';
import passport from 'passport';
import IRequestWithUser from '../shared/interfaces/IRequestWithUser';
import { configured as pgConfigured } from '../shared/databaseConfig';

const router = Router();

const selectAllCampaignsAndCalls: string = `SELECT *, campaign.id as campaign_id, call.id as call_id
FROM campaign
LEFT JOIN call 
ON campaign_id = call.campaign_id
WHERE campaign.app_user_id = $1
`;

/*
  Passes full account data back to an authenticated user

  If rejected, 401 status is returned
*/
// @ts-ignore
router.get('/accountData', passport.authenticate('local'), async (req: IRequestWithUser, res: Response) => {
  const { id: appUserId } = req.user!;

  try {
    const campaignPlusCallData = await pgConfigured
      .manyOrNone(selectAllCampaignsAndCalls, appUserId);
    console.log('campaignPlusCallData', campaignPlusCallData);

    res.json({ data: campaignPlusCallData });
  } catch (error) {
    res.json({ errorName: error.name, message: error.message });
  }
});

export default router;
