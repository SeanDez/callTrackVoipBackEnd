import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import moment from 'moment';
import PGPromise from 'pg-promise';
import dotenv from 'dotenv';
import lodash from 'lodash';
import { PGPromiseOptions } from '../shared/databaseConfig';

dotenv.config();

interface VoipMsProperties {
  userName: string;
  apiPassword: string;
}

interface CallRecord {
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

interface SaveableCallRecordFields {
  uniqueId: string,
  callerId: string,
  date: string,
  description: string,
  account: string,
  disposition: string,
  seconds: string,
  campaign_phoneNumber: string
}

function isRequest(input: VoipMsProperties | Request): input is Request {
  return (input as Request).body !== 'undefined';
}

function setUserName(input: VoipMsProperties | Request) {
  let userName: string;

  if (isRequest(input)) {
    userName = input.body.userName;
  } else {
    userName = input.userName;
  }

  return userName;
}

function formatCallRecordsForPGPromise(calldata: CallRecord[]): SaveableCallRecordFields[] {
  const formattedData = calldata.map((record: CallRecord) => {
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

function extractDestinationPhoneNumbers(callData: CallRecord[]) {
  const allPhoneNumbers = callData.map((record: CallRecord) => record.destination);
  const uniqueNumbers = lodash.uniq(allPhoneNumbers);
  return uniqueNumbers;
}

async function saveNewCallRecords(db: any, callData: CallRecord[]) {
  const callDataFormattedForInsert = formatCallRecordsForPGPromise(callData);
  const callColumns = new PGPromiseOptions.helpers.ColumnSet(['uniqueId', 'callerId', 'date', 'description', 'account', 'disposition', 'seconds', 'campaign_phoneNumber']);
  const callTable = 'call';
  const callMultiInsertQuery = PGPromiseOptions.helpers.insert(
    callDataFormattedForInsert, callColumns, callTable,
  );
  try {
    await db.none(callMultiInsertQuery);
  } catch (error) {
    throw new Error(error);
  }
}

export default class AsyncCallData {
  private userId: string = ''; // properly initialized with this.initializeAsyncValues()

  private userName: string;

  private pgPromiseOptions: ReturnType<typeof PGPromise>;

  constructor(
    input: VoipMsProperties | Request,
    private pgPromiseConfigured: ReturnType<ReturnType<typeof PGPromise>>,
  ) {
    this.pgPromiseOptions = PGPromise({
      capSQL: true,
    });
    this.pgPromiseConfigured = pgPromiseConfigured;
    this.userName = setUserName(input);
  }

  // --------------- Public Methods

  public async initializeAsyncValues() {
    this.userId = await this.setUserID();
  }

  public async captureCallData(input: VoipMsProperties | Request, res?: Response): Promise<void> {
    try {
      const callData: CallRecord[] = await this.fetchCallData(input, res);

      await this.insertNewCampaignsIfNoMatchingPhoneNumber(
        this.pgPromiseConfigured, callData, this.userId, this.userName,
      );

      await saveNewCallRecords(this.pgPromiseConfigured, callData);
    } catch (error) {
      throw new Error(error);
    }
  }

  // --------------- Internal Methods

  private async fetchCallData(input: VoipMsProperties | Request, res?: Response) {
    let apiPassword;
    let daysBack;

    if (isRequest(input)) {
      apiPassword = input.body.apiPassword;
      daysBack = 90;
    } else {
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

    const requestUrl = `http://voip.ms/api/v1/rest.php?api_username=${this.userName}&api_password=${apiPassword}&method=${apiMethod}&date_from=${startDate}&date_to=${endDate}&timezone=${timeZone}&answered=${answered}&noanswer=${noanswer}&busy=${busy}&failed=${failed}`;

    try {
      const response = await fetch(requestUrl, {
        headers: {
          'content-type': 'application/json',
        },
        mode: 'cors',
        method: 'get',
      });

      const callData: CallRecord[] = await response.json();

      if (typeof res !== 'undefined') {
        if (response.ok) {
          res.status(204).send();
        } else {
          throw new Error('fetchCallData, response.ok was falsy');
        }
      }

      return Promise.resolve(callData);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async insertNewCampaignsIfNoMatchingPhoneNumber(
    pgPromiseConfigured: any, callData: CallRecord[], userId: string, userName: string,
  ) {
    const uniqueNumbers = extractDestinationPhoneNumbers(callData);
    const campaignData = uniqueNumbers.map((phoneNumber: string) => ({
      phoneNumber: PGPromiseOptions.as.number(Number(phoneNumber)),
      status: 'active',
      app_user_id: this.userId,
    }));
    const campaignColumns = ['phoneNumber', 'status', 'app_user_id'];
    const campaignTable = { table: 'campaign' };
    const multiValueInsert = PGPromiseOptions.helpers.insert(
      campaignData, campaignColumns, campaignTable,
    );
    const campaignQueryWithNoConflicts = `${multiValueInsert} ON CONFLICT DO NOTHING`;

    try {
      await this.pgPromiseConfigured.none(campaignQueryWithNoConflicts);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async setUserID() {
    try {
      const userId: string = await this.pgPromiseConfigured.one(
        'SELECT id FROM app_user WHERE user_name = $1',
        [this.userName],
        (record: any) => record.id,
      );

      return userId;
    } catch (error) {
      throw new Error(error);
    }
  }
}
