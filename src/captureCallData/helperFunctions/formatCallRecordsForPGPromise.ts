import PGPromise from 'pg-promise';
import lodash from 'lodash';
import * as pgp from '../../shared/databaseConfig';
import SaveableCallRecordFields from '../interfaces/SaveableCallRecordFields';
import CallRecord from '../interfaces/CallRecord';

interface PhoneNumberKeyedCallData {
  [phoneNumber: string]: CallRecord[]
}

export default async function formatCallRecordsForPGPromise(
  rawCalldata: CallRecord[],
): Promise<SaveableCallRecordFields[]> {
  const dataSortedbyPhoneNumber: PhoneNumberKeyedCallData = lodash.groupBy(rawCalldata,
    (record: CallRecord) => record.destination);

  const phoneNumberAndGroupedData: [string, CallRecord[]][] = Object
    .entries(dataSortedbyPhoneNumber);

  const allDataFlattened: SaveableCallRecordFields[] = phoneNumberAndGroupedData
    .map((numberAndCallData: [string, CallRecord[]]) => {
      const phoneNumber = numberAndCallData[0];

      // todo get the campain id from a db query
      const query = 'SELECT id FROM campaign WHERE phoneNumber = $1';

      let campaign_id: number;
      try {
        campaign_id = await pgp.configured.one(query, phoneNumber);
      } catch (error) {
        throw new Error(error);
      }

      const formattedDataSet: SaveableCallRecordFields[] = numberAndCallData[1]
        .map((record: CallRecord) => {
          const {
            date, callerid, destination, description, account, disposition, seconds, uniqueid,
          } = record;

          const formattedData: SaveableCallRecordFields = {
            unique_id: uniqueid,
            caller_id: callerid,
            date: PGPromise.as.date(new Date(date)),
            description,
            account,
            disposition,
            seconds: PGPromise.as.number(Number(seconds)),
            campaign_id: PGPromise.as.number(Number(campaign_id)),
          };

          return formattedData;
        });

      return formattedDataSet;
    })
    .flat();

  return allDataFlattened;
}
