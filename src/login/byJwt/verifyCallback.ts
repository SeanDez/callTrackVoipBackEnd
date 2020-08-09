import { Client as PgClient } from 'pg';

const selectUserQuery = `SELECT userName
FROM user
WHERE userName = $1::text;
`;

type UserMatch = ['app_user', string]

async function verifyCallback(userName: string, jwtPayload, doneCallback: done) {
  const pgClient = new PgClient();
  try {
    await pgClient.connect();
    const queryResult = await pgClient.query(selectUserQuery, [userName]);
    const match: UserMatch = queryResult.rows[0];
    if (match) {
      return doneCallback(null, match);
    }

    return doneCallback(null, false);
  } catch (error) {
    return doneCallback(error, false);
  }
}

export verifyCallback;
