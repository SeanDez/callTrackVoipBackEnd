import { Router } from 'express';
import updateCampaign from './routeHandlerCallback';

const router = Router();
router.post('/update/campaign', updateCampaign);

export default router;
