import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import moment from 'moment';
import PGPromise from 'pg-promise';
import dotenv from 'dotenv';
import { optioned } from '../shared/databaseConfig';
import saveNewCallRecords from './helperFunctions/saveNewCallRecords';
import extractDestinationPhoneNumbers from './helperFunctions/extractDestinationPhoneNumbers';
import setVoipMsUserName from './helperFunctions/setUserName';
import isRequest from './helperFunctions/isRequest';
import VoipMsProperties from './interfaces/VoipMsProperties';
import CallRecord from './interfaces/CallRecord';

dotenv.config();

type PGPromiseConnection = ReturnType<ReturnType<typeof PGPromise>>;

export default class AsyncCallData {
  private voipms_username: string;

  private pgPromiseOptions: ReturnType<typeof PGPromise>;

  constructor(
    input: VoipMsProperties | Request,
    private pgPromiseConfigured: PGPromiseConnection,
    private userId?: string | undefined,
  ) {
    this.pgPromiseOptions = PGPromise({
      capSQL: true,
    });
    this.voipms_username = setVoipMsUserName(input);
  }

  // --------------- Public Methods

  public async initializeAsyncValues() {
    if (typeof this.userId === 'undefined') {
      this.userId = await this.setUserID();
    }
  }

  public async captureCallData(input: VoipMsProperties | Request, res?: Response): Promise<void> {
    const dbConnection = await this.pgPromiseConfigured.connect();

    // it's an object
    // callData.cdr is what i want
    const callData: CallRecord[] = await this.fetchCallData(input, res);

    await this.insertNewCampaignsForNewPhoneNumbers(
      this.pgPromiseConfigured, callData, this.userId!, this.voipms_username,
    );

    await saveNewCallRecords(this.pgPromiseConfigured, callData);

    dbConnection.done();
  }

  // --------------- Internal Methods

  private async fetchCallData(input: VoipMsProperties | Request, res?: Response) {
    let voipms_api_password;
    let daysBack;

    if (isRequest(input)) {
      voipms_api_password = input.body.voipms_api_password;
      daysBack = 90;
    } else {
      voipms_api_password = input.voipms_api_password;
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

    const requestUrl = `http://voip.ms/api/v1/rest.php?api_username=${this.voipms_username}&api_password=${voipms_api_password}&method=${apiMethod}&date_from=${startDate}&date_to=${endDate}&timezone=${timeZone}&answered=${answered}&noanswer=${noanswer}&busy=${busy}&failed=${failed}`;

    try {
      const response = await fetch(requestUrl, {
        headers: {
          'content-type': 'application/json',
        },
        mode: 'cors',
        method: 'get',
      });

      const voipMsData = await response.json();
      const cdrData: CallRecord[] = voipMsData.cdr;

      if (typeof res !== 'undefined') {
        if (response.ok) {
          res.status(204).send();
        } else {
          throw new Error('fetchCallData, response.ok was falsy');
        }
      }

      return cdrData;
    } catch (error) {
      throw new Error(error);
    }
  }

  /*
    Auto-creates new campaign records when there is no campaign with a phone number
  */
  private async insertNewCampaignsForNewPhoneNumbers(
    pgPromiseConfigured: any, callData: CallRecord[], userId: string, userName: string,
  ) {
    const uniqueNumbers = extractDestinationPhoneNumbers(callData);
    const campaignData = uniqueNumbers.map((phoneNumber: string) => ({
      phoneNumber,
      status: 'active',
      app_user_id: this.userId,
    }));
    const campaignColumns = ['phoneNumber', 'status', 'app_user_id'];
    const campaignTable = { table: 'campaign' };
    const multiValueInsert = optioned.helpers.insert(
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
        'SELECT id FROM app_user WHERE voipms_user_email = $1',
        [this.voipms_username],
        (record: { id: number }) => record.id.toString(),
      );

      if (typeof userId !== 'string') {
        throw new Error(`User ID not found for user ${this.voipms_username}`);
      }

      return userId;
    } catch (error) {
      throw new Error(error);
    }
  }
}
