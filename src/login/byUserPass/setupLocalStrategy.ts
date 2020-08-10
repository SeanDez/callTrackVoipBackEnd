/* eslint-disable camelcase */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Client as PgClient } from 'pg';
import bcrypt from 'bcrypt';

const selectUserQuery = `SELECT userName, passHash
FROM user
WHERE userName = $1::text;
`;

interface UserMatch {
  user_name: string,
  pass_hash: string
}

async function useDatabaseToVerifyUserAndPassword(userName: string,
  formPassword: string, doneCallback: any) {
  const pgClient = new PgClient();

  try {
    await pgClient.connect();
    const queryResult = await pgClient.query(selectUserQuery, [userName]);
    const userData: UserMatch = queryResult.rows[0];
    const hashesMatch: boolean = await bcrypt.compare(formPassword, userData.pass_hash);

    if (hashesMatch) {
      return doneCallback(null, userData);
    }

    return doneCallback(null, false); // username not found or passHash mismatch. Prints 401 UnAuth
  } catch (error) {
    return doneCallback(error, false);
  }
}

// assign the database login callback to the strategy
const databaseLogin = new LocalStrategy({
  usernameField: 'userEmail',
}, useDatabaseToVerifyUserAndPassword);
// add the 'local' strategy as a passport middleware
passport.use(databaseLogin);

export default passport;
