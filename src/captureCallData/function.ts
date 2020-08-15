import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import moment from 'moment';
import PGPromise from 'pg-promise';
import dotenv from 'dotenv';
import lodash from 'lodash';

const PGPromiseOptions = PGPromise({
  capSQL: true,
});

dotenv.config();

interface VoipMsProperties {
  userName: string;
  apiPassword: string;
}

interface CallData {
    date: string; // "2020-08-11 11:43:12";
    callerid: string; // "8335951058";
    destination: string; // "9093455007";
    description: string; // "Inbound DID";
    account: string; // "154240";
    disposition: string; // "ANSWERED";
    duration: string; // "00:00:08";
    seconds: string; // "8";
    rate: string; // "0.00900000";
    total: string; // "0.00180000";
    uniqueid: string; // "2125241911";
    useragent: string; // "";
    ip: string; // "";
}

type SaveableCallRecordFields = {

};

function formatCallRecordsForPGPromise(calldata: CallData[]): SaveableCallRecordFields[] {
  const formattedData = calldata.map((record: CallData) => {
    const {
      date, callerid, destination, description, account, disposition, seconds, uniqueid,
    } = record;

    return {
      uniqueId: PGPromise.as.number(Number(uniqueid)),
      callerId: callerid,
      date: PGPromise.as.date(new Date(date)),
      description,
      account,
      disposition,
      seconds: PGPromise.as.number(Number(seconds)),
      campaign_phoneNumber: PGPromise.as.number(Number(destination)),
    };
  });
  return formattedData;
}

function extractDestinationPhoneNumbers(callData: CallData[]) {
  const allPhoneNumbers = callData.map((record: CallData) => record.destination);
  const uniqueNumbers = lodash.uniq(allPhoneNumbers);
  return uniqueNumbers;
}

const multiInsertNewCampaigns = 'INSERT INTO campaign (number, app_user_id) VALUES %L';

const multiInsertCallData = 'INSERT INTO calls (uniqueId, destination, callerID, description, account, disposition, seconds) VALUES %L';

function isRequest(input: VoipMsProperties | Request): input is Request {
  return (input as Request).body !== 'undefined';
}

async function captureCallData(input: VoipMsProperties | Request, res?: Response): Promise<void> {
  let userName;
  let apiPassword;
  let daysBack;

  if (isRequest(input)) {
    userName = input.body.userName;
    apiPassword = input.body.apiPassword;
    daysBack = 90;
  } else {
    userName = input.userName;
    apiPassword = input.apiPassword;
    daysBack = 3;
  }

  const apiMethod = 'getCDR';
  const startDate = moment().subtract(daysBack, 'days').format('YYYY[-]MM[-]DD');
  const endDate = moment().format('YYYY[-]MM[-]DD'); // now
  const timeZone = -5;
  const answered = 1;
  const noanswer = 1;
  const busy = 1;
  const failed = 1;

  const requestUrl = `http://voip.ms/api/v1/rest.php?api_username=${userName}&api_password=${apiPassword}&method=${apiMethod}&date_from=${startDate}&date_to=${endDate}&timezone=${timeZone}&answered=${answered}&noanswer=${noanswer}&busy=${busy}&failed=${failed}`;

  try {
    const response = await fetch(requestUrl, {
      headers: {
        'content-type': 'application/json',
      },
      mode: 'cors',
      method: 'get',
    });

    const callData: CallData[] = await response.json();

    // todo save to database
    // create new campaigns first (new numbers)
    // add call data next
    // todo pass connection details
    const pgPromiseConfiged = PGPromiseOptions({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    });

    const userId: string = await pgPromiseConfiged.one(
      'SELECT id FROM app_user WHERE user_name = $1',
      [userName],
      (record: any) => record.id,
    );

    // todo insert campaigns (if no phone number found)
    const uniqueNumbers = extractDestinationPhoneNumbers(callData);
    const campaignData = uniqueNumbers.map((phoneNumber: string) => ({
      phoneNumber: PGPromiseOptions.as.number(Number(phoneNumber)),
      status: 'active',
      app_user_id: userId,
    }));
    const campaignColumns = ['phoneNumber', 'status', 'app_user_id'];
    const campaignTable = { table: 'campaign' };
    const multiInsertString = PGPromiseOptions.helpers.insert(
      campaignData, campaignColumns, campaignTable,
    );
    const campaignQueryWithNoConflicts = `${multiInsertString} ON CONFLICT DO NOTHING`;
    await pgPromiseConfiged.none(campaignQueryWithNoConflicts);

    // save the call data to database
    // define columns and table
    const callDataFormattedForInsert = formatCallRecordsForPGPromise(callData);
    const callColumns = new PGPromiseOptions.helpers.ColumnSet(['uniqueId', 'callerId', 'date', 'description', 'account', 'disposition', 'seconds', 'campaign_phoneNumber']);
    const callTable = 'call';
    const callMultiInsertQuery = PGPromiseOptions.helpers.insert(
      callDataFormattedForInsert, callColumns, callTable,
    );
    await pgPromiseConfiged.none(callMultiInsertQuery);

    // todo multi insert
    // figure out what info is needed for each table insert
    // ANSWER: USER ID ONLY
    // table campaign
      // insert if not exists: campaign.phoneNumber = number
      // status: active
      // app_user_id = id

    // calls campaign
      // insert if not exists: uniqueId = uniqueid (lowercase i)
      // {...recordData}


    // if there's a response object, then send a response
    if (res) {
      if (response.ok) {
        res.status(204).send();
      } else {
        throw new Error('fetchCallData, response.ok was falsy');
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}

export default captureCallData;
