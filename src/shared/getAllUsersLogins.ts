import { Client as PGClient, QueryResult } from 'pg';
import Cryptor from 'cryptr';
import dotenv from 'dotenv';
import { AppUserIdAndVoipMsCredentialsEncrypted } from './interfaces/AppUserIdAndVoipMsCredentialsEncrypted';
import IVoipUserLoginsDecrypted from './interfaces/IVoipUserLoginsDecrypted';

dotenv.config();

const cryptr = new Cryptor(process.env.CRYPTR_SECRET!);

const selectAllVoipMsUsersInfo = 'SELECT id, user_name, voipms_user_email, voipms_password_encrypted FROM app_user';

async function getAllVoipMsUsersAndLoginData()
  : Promise<Array<IVoipUserLoginsDecrypted> | null> {
  try {
    const pgClient = new PGClient();
    pgClient.connect();
    const queryresult: QueryResult = await pgClient.query(selectAllVoipMsUsersInfo);
    pgClient.end();

    if (queryresult.rows.length > 0) {
      const guardedData = queryresult.rows;

      const decryptedLogins: IVoipUserLoginsDecrypted[] = guardedData.map(
        (record: AppUserIdAndVoipMsCredentialsEncrypted) => ({
          id: record.id,
          user_name: record.user_name,
          voip_userName: record.voipms_user_email,
          voip_password: cryptr.decrypt(record.voipms_password_encrypted),
        }),
      );

      return decryptedLogins;
    }

    return null;
  } catch (error) {
    throw new Error(error);
  }
}

export default getAllVoipMsUsersAndLoginData;
