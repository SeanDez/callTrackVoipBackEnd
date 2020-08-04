import { Pool as PGPool } from 'pg';
// eslint-disable-next-line no-unused-vars
import { Request, Response, Router } from 'express';
import userIdQuery from '../shared/getUserId';
import updateCampaignQuery from './updateQuery';

// eslint-disable-next-line no-unused-vars
import UpdateableColumns from './updateableColumns';

interface UpdateBodyParams {
  userName: string,
  columnName: UpdateableColumns,
  andClauses?: string,
}

async function updateCampaign(req: Request, res: Response) {
  // get userId
  const {
    userName, columnName, newValue, andClauses,
  }: UpdateBodyParams = req.body;

  const pgPool = new PGPool();
  try {
    // todo figure out what actually comes back from this
    // todo figure out what actually comes back from this
    // todo figure out what actually comes back from this
    const userId = await pgPool.query(userIdQuery(userName));
    await pgPool.query(updateCampaignQuery(userId, columnName, newValue, andClauses));

    res.status(204).send(); // success, no content
  } catch (error) {
    throw new Error(error.stack);
  }

  // target the right table, column, row
}

const router = Router();
router.post('/update/campaign', updateCampaign);

export default router;
