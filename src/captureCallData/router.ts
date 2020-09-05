import { Router, Request, Response } from 'express';
import AsyncCallData from './AsyncCallData';
import { configured } from '../shared/databaseConfig';
import IRequestWithUser from '../shared/interfaces/isRequestWithUser';

const router: Router = Router();

// @ts-ignore
router.post('/callData', async (req: IRequestWithUser, res: Response) => {
  console.log('inside /callData');
  const asyncCallData = new AsyncCallData(req, res);
  await asyncCallData.initializeAsyncValues();
  await asyncCallData.captureCallData(req, res);
});

export default router;
