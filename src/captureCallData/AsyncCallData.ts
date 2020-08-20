import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import moment from 'moment';
import PGPromise from 'pg-promise';
import dotenv from 'dotenv';
import { PGPromiseOptions } from '../shared/databaseConfig';
import saveNewCallRecords from './helperFunctions/saveNewCallRecords';
import { extractDestinationPhoneNumbers } from './helperFunctions/extractDestinationPhoneNumbers';
import { setUserName } from './helperFunctions/setUserName';
import { isRequest } from './helperFunctions/isRequest';
import { VoipMsProperties } from './interfaces/VoipMsProperties';
import { CallRecord } from './interfaces/CallRecord';

dotenv.config();

type PGPromiseConnection = ReturnType<ReturnType<typeof PGPromise>>;

export default class AsyncCallData {
  private userName: string;

  private pgPromiseOptions: ReturnType<typeof PGPromise>;

  constructor(
    input: VoipMsProperties | Request,
    private pgPromiseConfigured: PGPromiseConnection,
    private userId?: string | undefined,
  ) {
    this.pgPromiseOptions = PGPromise({
      capSQL: true,
    });
    this.userName = setUserName(input);
  }

  // --------------- Public Methods

  public async initializeAsyncValues() {
    if (this.userId === 'undefined') {
      this.userId = await this.setUserID();
    }
  }

  public async captureCallData(input: VoipMsProperties | Request, res?: Response): Promise<void> {
    const dbConnection = await this.pgPromiseConfigured.connect();

    const callData: CallRecord[] = await this.fetchCallData(input, res);

    await this.insertNewCampaignsIfNoMatchingPhoneNumber(
      this.pgPromiseConfigured, callData, this.userId!, this.userName,
    );

    await saveNewCallRecords(this.pgPromiseConfigured, callData);

    await dbConnection.done();
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
