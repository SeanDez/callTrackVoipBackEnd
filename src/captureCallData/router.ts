import { Router } from 'express';
import captureCallData from './function';

const router: Router = Router();

router.post('/callData', captureCallData);

export default router;
