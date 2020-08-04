import { Router } from 'express';
import updateCampaign from './routeHandler';

const router = Router();
router.post('/update/campaign', updateCampaign);

export default router;
