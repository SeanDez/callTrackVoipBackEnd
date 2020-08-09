import { Router } from 'express';
import fetchCallData from './routeHandlerCallback';

const router: Router = Router();

router.post('/callData', fetchCallData);

export default router;
