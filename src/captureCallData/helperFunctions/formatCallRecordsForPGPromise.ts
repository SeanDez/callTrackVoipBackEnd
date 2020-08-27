import PGPromise from 'pg-promise';
import lodash from 'lodash';
import * as pgp from '../../shared/databaseConfig';
import SaveableCallRecord from '../interfaces/SaveableCallRecordFields';
import CallRecord from '../interfaces/CallRecord';

interface PhoneNumberKeyedCallData {
  [phoneNumber: string]: CallRecord[]
}

export default async function formatCallRecordsForPGPromise(
  rawCalldata: CallRecord[],
): Promise<SaveableCallRecord[]> {
  const dataSortedbyPhoneNumber: PhoneNumberKeyedCallData = lodash.groupBy(rawCalldata,
    (record: CallRecord) => record.destination);

  const phoneNumberAndGroupedData: [string, CallRecord[]][] = Object
    .entries(dataSortedbyPhoneNumber);

  const allData: Promise<SaveableCallRecord[]>[] = phoneNumberAndGroupedData
    .map(async (numberAndCallData: [string, CallRecord[]]) => {
      const phoneNumber = numberAndCallData[0];

      const selectCampaignId = 'SELECT id FROM campaign WHERE phoneNumber = $1';

      let campaign_id: number;
      try {
        campaign_id = await pgp.configured.one(
          selectCampaignId, phoneNumber, (queryResult: { id: number }) => queryResult.id,
        );
      } catch (error) {
        throw new Error(error);
      }

      const formattedDataSet: SaveableCallRecord[] = numberAndCallData[1]
        .map((record: CallRecord) => {
          const {
            date, callerid, destination, description, account, disposition, seconds, uniqueid,
          } = record;

          const formattedData: SaveableCallRecord = {
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
    });

  await Promise.all(allData);

  const allDataFlattened = allData.flat() as unknown as SaveableCallRecord[];

  return allDataFlattened;
}
