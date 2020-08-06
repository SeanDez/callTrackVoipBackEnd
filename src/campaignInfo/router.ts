// eslint-disable-next-line no-unused-vars
import { Router } from 'express';
import fetchAllCampaignDataForOneUser from './routeHandlerCallback';

const router = Router();
router.post('/campaigns', fetchAllCampaignDataForOneUser);

export default router;
