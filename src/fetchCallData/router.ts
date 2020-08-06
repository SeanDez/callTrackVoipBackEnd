import { Router } from 'express';
import fetchCallData from './routeHandlerCallBack';

const router: Router = Router();

router.post('/callData', fetchCallData);

export default router;
