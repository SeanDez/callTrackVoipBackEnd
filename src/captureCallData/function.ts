import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { Client as PGClient, QueryResult } from 'pg';
import moment from 'moment';
import getUserIDQuery from '../shared/getUserIdQuery';
import PGPromise from 'pg-promise';

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

type requiredFields = 'date' | 'callerid' | 'destination' | 'description' | 'account' | 'disposition' | 'seconds' | 'uniqueid';
type SaveableCallRecordFields = Pick<CallData, requiredFields>;

function formatCallRecordsForPGPromise(calldata: CallData[]): SaveableCallRecordFields[] {
  const formattedData = calldata.map((record: CallData) => {
    const {
      date, callerid, destination, description, account, disposition, seconds, uniqueid,
    } = record;

    return {
      callerid,
      destination,
      description,
      account,
      disposition,
      date: PGPromise.as.date(new Date(date)),
      seconds: PGPromise.as.number(Number(seconds)),
      uniqueid: PGPromise.as.number(Number(uniqueid)),
    };
  });
  return formattedData;
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

    // todo save to database
    // create new campaigns first (new numbers)
    // add call data next

    const callData: CallData[] = await response.json();
    // save the call data to database

    const pgClient = new PGClient();
    pgClient.connect()
    const uIDQueryResult = await pgClient.query(getUserIDQuery, [userName]);
    const userId = uIDQueryResult.rows[0].id;

    await pgClient.query(multiInsertQuery);

    pgClient.end();

    // if there's a response object, then send a response
    if (res) {
      if (response.ok) {
        res.status(204).send();
      }

      throw new Error('fetchCallData, response.ok was falsy');
    }
  } catch (error) {
    throw new Error(error);
  }
}

export default captureCallData;
