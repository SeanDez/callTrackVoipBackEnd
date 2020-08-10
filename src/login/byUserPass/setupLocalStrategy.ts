/* eslint-disable camelcase */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Client as PgClient } from 'pg';
import bcrypt from 'bcrypt';

const selectUserQuery = `SELECT id, user_name, password_hash
FROM app_user
WHERE user_name = $1::text;
`;

interface UserMatch {
  id: string,
  user_name: string,
  password_hash: string
}

async function useDatabaseToVerifyUserAndPassword(userName: string,
  formPassword: string, doneCallback: any) {
  const pgClient = new PgClient();

  try {
    await pgClient.connect();
    const queryResult = await pgClient.query(selectUserQuery, [userName]);
    pgClient.end();
    const userData: UserMatch = queryResult.rows[0];
    // const hashesMatch: boolean = await bcrypt.compare(formPassword, userData.password_hash);
    // todo add bcrypt hash comparison
    const hashesMatch = formPassword === userData.password_hash; // not a real hash test!

    if (hashesMatch) {
      return doneCallback(null, {
        id: userData.id,
        user_name: userData.user_name,
      }); // feeds into req.user
    }

    return doneCallback(null, false); // username not found or passHash mismatch. Prints 401 UnAuth
  } catch (error) {
    return doneCallback(error, false);
  }
}

// assign the database login callback to the strategy
const localStrategy = new LocalStrategy(useDatabaseToVerifyUserAndPassword);
// add the 'local' strategy as a passport middleware
passport.use(localStrategy);

export default passport;
