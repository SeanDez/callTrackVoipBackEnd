import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import moment from 'moment';
import PGPromise from 'pg-promise';
import dotenv from 'dotenv';
import Cryptr from 'cryptr';
import { optioned as pgOptioned, configured as pgConfigured } from '../shared/databaseConfig';
import saveNewCallRecords from './helperFunctions/saveNewCallRecords';
import extractUniqueDestinations from './helperFunctions/extractDestinationPhoneNumbers';
import IRequestWithUser from '../shared/interfaces/IRequestWithUser';
import { AppUserIdAndVoipMsCredentialsEncrypted } from '../shared/interfaces/AppUserIdAndVoipMsCredentialsEncrypted';
import CallRecord from './interfaces/CallRecord';

dotenv.config();

const cryptr = new Cryptr(process.env.CRYPTR_SECRET!);

export default class AsyncCallData {
  private localUserId: string | undefined;

  private localUserName: string;

  private voipms_username: string | undefined;

  private voip_password_decrypted: string | undefined;

  private pgPromiseOptions: ReturnType<typeof PGPromise>;

  constructor(
    private req: IRequestWithUser,
    private res: Response,
  ) {
    this.pgPromiseOptions = PGPromise({
      capSQL: true,
    });
    this.localUserName = this.req.user.user_name!;
  }

  // --------------- Public Methods

  public async initializeAsyncValues(): Promise<void> {
    const {
      id: app_user_id, voipms_user_email, voipms_password_encrypted,
    } = await this.getUserInfo();

    this.localUserId = app_user_id;
    this.voipms_username = voipms_user_email;
    this.voip_password_decrypted = cryptr.decrypt(voipms_password_encrypted);
  }

  public async captureCallData(req: IRequestWithUser, res: Response): Promise<void> {
    const dbConnection = await pgConfigured.connect();
    const callData: CallRecord[] | undefined = await this.fetchCallData(req, res);

    if (callData) {
      try {
        await this.insertNewCampaignsForNewPhoneNumbers(
          pgConfigured, callData, this.localUserId!, this.voipms_username!,
        );
        await saveNewCallRecords(pgConfigured, callData);
        dbConnection.done();
      } catch (error) {
        res.json({ errorName: error.name, message: error.message });
      }
    }
  }

  // --------------- Internal Methods

  /*
    Fetches an array of call data records
  */
  // eslint-disable-next-line consistent-return
  private async fetchCallData(input: IRequestWithUser, res: Response)
  : Promise<CallRecord[] | undefined> {
    const apiMethod = 'getCDR';
    const startDate = moment().subtract(90, 'days').format('YYYY[-]MM[-]DD');
    const endDate = moment().format('YYYY[-]MM[-]DD'); // now
    const timeZone = -5;
    const answered = 1;
    const noanswer = 1;
    const busy = 1;
    const failed = 1;

    const requestUrl = `http://voip.ms/api/v1/rest.php?api_username=${this.voipms_username}&api_password=${this.voip_password_decrypted}&method=${apiMethod}&date_from=${startDate}&date_to=${endDate}&timezone=${timeZone}&answered=${answered}&noanswer=${noanswer}&busy=${busy}&failed=${failed}`;

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

      if (response.ok) {
        return cdrData;
      }

      res.json({ message: 'fetchCallData, response.ok was falsy' });
    } catch (error) {
      res.json({ errorName: error.name, message: error.message });
    }
  }

  /*
    Auto-creates new campaign records when there is no campaign with a phone number
  */
  private async insertNewCampaignsForNewPhoneNumbers(
    pgPromiseConfigured: any, callData: CallRecord[], userId: string, userName: string,
  ): Promise<void> {
    const uniqueNumbers = extractUniqueDestinations(callData);
    const formattedCampaignData = uniqueNumbers.map((phoneNumber: string) => ({
      phoneNumber,
      status: 'active',
      app_user_id: this.localUserId,
    }));
    const campaignColumns = ['phoneNumber', 'status', 'app_user_id'];
    const campaignTable = { table: 'campaign' };
    const multiValueInsert = pgOptioned.helpers.insert(
      formattedCampaignData, campaignColumns, campaignTable,
    );
    const campaignQueryWithNoConflicts = `${multiValueInsert} ON CONFLICT DO NOTHING`;

    try {
      await pgConfigured.none(campaignQueryWithNoConflicts);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async getUserInfo(): Promise<AppUserIdAndVoipMsCredentialsEncrypted> {
    try {
      const userInfo: string = await pgConfigured.one(
        'SELECT * FROM app_user WHERE user_name = $1',
        [this.localUserName as string],
      );

      if (typeof userInfo !== 'object') {
        throw new Error(`User info not found for user ${this.voipms_username}`);
      }

      return userInfo;
    } catch (error) {
      throw new Error(error);
    }
  }
}
