/* eslint-disable camelcase */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Client as PgClient } from 'pg';
import bcrypt from 'bcrypt';

const selectUserQuery = `SELECT *
FROM app_user
WHERE CAST(user_name as TEXT) = CAST($1 as TEXT);
`;

interface UserMatch {
  id: string;
  user_name: string;
  password_hash: string;
  voipms_user_email: string;
  voipms_password_encrypted: string;
}

async function useDatabaseToVerifyUserAndPassword(localUserName: string,
  localPassword: string, doneCallback: any) {
  const pgClient = new PgClient();

  try {
    await pgClient.connect();
    const queryResult = await pgClient.query(selectUserQuery, [localUserName]);
    pgClient.end();
    const userData: UserMatch = queryResult.rows[0];

    const hashesMatch: boolean = await bcrypt.compare(localPassword, userData.password_hash);

    if (hashesMatch) {
      return doneCallback(null, userData); // feeds into req.user
    }

    return doneCallback(null, false); // username not found or passHash mismatch. Prints 401 UnAuth
  } catch (error) {
    return doneCallback(error, false);
  }
}

const strategyOptions = {
  usernameField: 'localUserName',
  passwordField: 'localPassword',
};

// assign the database login callback to the strategy
const localStrategy = new LocalStrategy(strategyOptions, useDatabaseToVerifyUserAndPassword);
// add the 'local' strategy as a passport middleware
passport.use(localStrategy);

export default passport;
