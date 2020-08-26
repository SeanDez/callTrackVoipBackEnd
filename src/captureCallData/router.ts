import { Router, Request, Response } from 'express';
import AsyncCallData from './AsyncCallData';
import { configured } from '../shared/databaseConfig';

const router: Router = Router();

router.post('/callData', async (req: Request, res: Response) => {
  const asyncCallData = new AsyncCallData(req, configured);
  await asyncCallData.initializeAsyncValues();
  await asyncCallData.captureCallData(req, res);
});

export default router;
