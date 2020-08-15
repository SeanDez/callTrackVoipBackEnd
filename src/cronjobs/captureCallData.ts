/* eslint-disable no-console */
import { CronJob } from 'cron';
import PGPromise from 'pg-promise';
import captureCallData from '../captureCallData/function';

const pgPromise = PGPromise({
  capSQL: true,
});



// 9:34am, 22nd of every 3rd month
const every12Hours = '* */12 * * *';

const selectAllUserIds = 'SELECT id FROM app_user';

console.log('About to instantiate cron job "captureCallDataEvery12Hours"');

const captureCallDataEvery12Hours = new CronJob(every12Hours, () => {
  try {

  } catch (error) {
    console.log(error);
  }
});

console.log('captureCallDataEvery12Hours has been instantiated. Job should begin...');

captureCallDataEvery12Hours.start();

export default {};
