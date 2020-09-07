import { Router, Request, Response } from 'express';
import passport from 'passport';
import AsyncCallData from './AsyncCallData';

const router: Router = Router();

// @ts-ignore
router.get('/newCampaignAndCallData', passport.authenticate('local'), async (req: IRequestWithUser, res: Response) => {
  const asyncCallData = new AsyncCallData(req, res);
  try {
    await asyncCallData.initializeAsyncValues();
    await asyncCallData.captureCallData(req, res);
  } catch (error) {
    res.json({ errorName: error.name, message: error.message });
  }
});

export default router;
