import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Cryptr from 'cryptr';
import dotenv from 'dotenv';
import router from '../login/byUserPass/router';
import { configured as pgConfigured } from '../shared/databaseConfig';
import IRegistrationRequestBody from './interfaces/IRegistrationRequestBody';
import { has } from 'lodash';

dotenv.config();

const cryptr = new Cryptr(process.env.CRYPTR_SECRET!);

/*
  registers a new user locally by saving his/her details to the database

  then redirects to a local route for login
*/
router.post('/registerNewUser', async (req: Request, res: Response) => {
  const {
    localUserName, localPassword, voipms_user_email, voipMsPassword,
  } = req.body as IRegistrationRequestBody;

  const hashedPassword: string = bcrypt.hashSync(localPassword, 12);
  const encryptedVoipPassword = cryptr.encrypt(voipMsPassword);

  // hash the local password
  // encrypt the voip password
  // pass all 4 values to the database
  // test this with real data. delete my previous legit user info and make a real one instead

  try {
    const savedUser = await pgConfigured.one(
      'INSERT INTO app_user (user_name, password_hash,voipms_user_email, voipms_password_encrypted) values ($1, $2, $3, $4) RETURNING *',
      [localUserName, hashedPassword, voipms_user_email, encryptedVoipPassword],
    );
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.name, message: error.message });
  }
});

export default router;
