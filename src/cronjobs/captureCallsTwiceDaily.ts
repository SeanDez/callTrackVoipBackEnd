/* eslint-disable no-console */
import { CronJob } from 'cron';
import PGPromise from 'pg-promise';
import AsyncCallData from '../captureCallData/AsyncCallData';
import { VoipMsProperties } from '../captureCallData/interfaces/VoipMsProperties';
import getAllVoipMsUsersAndLoginData from '../shared/getAllUsersLogins';
import { IVoipUserLoginsDecrypted } from '../shared/IVoipUserLoginsDecrypted';

const every12Hours = '* */12 * * *';

const selectAllUserIdsQuery = 'SELECT name,  FROM app_user';

let everyUserNameAndVoipLogin: IVoipUserLoginsDecrypted[] | null;
(async () => {
  everyUserNameAndVoipLogin = await getAllVoipMsUsersAndLoginData();
})();

console.log('About to instantiate cron job "captureCallDataEvery12Hours"');

const captureCallDataEvery12Hours = new CronJob(every12Hours, () => {
  try {
    everyUserNameAndVoipLogin?.forEach((app_user: IVoipUserLoginsDecrypted) => {
      // todo run the main method
      // the forEach function handles iteration
      
    });
  } catch (error) {
    console.log(error);
  }
});

console.log('captureCallDataEvery12Hours has been instantiated. Job should begin...');

captureCallDataEvery12Hours.start();

export default {};
