import { Router } from 'express';
import fetchCallData from './callback';

const router: Router = Router();

router.post('/callData', fetchCallData);

export default router;
