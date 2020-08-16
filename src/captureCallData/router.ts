import { Router } from 'express';
import captureCallData from './AsyncCallData';

const router: Router = Router();

router.post('/callData', captureCallData);

export default router;
