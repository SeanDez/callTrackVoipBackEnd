import { Pool as PGPool } from 'pg';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import userIdQuery from '../shared/getUserIdQuery';
import updateCampaignQuery from './updateCampaignQuery';

// eslint-disable-next-line no-unused-vars
import UpdateableColumns from './updateableColumnsEnum';

interface UpdateBodyParams {
  userName: string,
  columnName: UpdateableColumns,
  newValue: string
}

interface userIdQueryResult {
  id: string
}

async function updateCampaign(req: Request, res: Response) {
  // get userId
  const {
    userName, columnName, newValue,
  }: UpdateBodyParams = req.body;

  const pgPool = new PGPool();
  try {
    const queryResult = await pgPool.query(userIdQuery(userName));
    const userId: string = (queryResult.rows as Array<userIdQueryResult>)[0].id;

    if (typeof userId === 'string') {
      await pgPool.query(updateCampaignQuery(userId, columnName, newValue));
      res.status(204).send(); // success, no content
    }

    throw new Error('user.id not found');
  } catch (error) {
    throw new Error(error.stack);
  }

  // target the right table, column, row
}

export default updateCampaign;
