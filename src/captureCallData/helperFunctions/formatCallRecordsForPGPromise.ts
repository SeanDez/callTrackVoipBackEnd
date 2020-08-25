import PGPromise from 'pg-promise';
import SaveableCallRecordFields from '../interfaces/SaveableCallRecordFields';
import CallRecord from '../interfaces/CallRecord';

export default function formatCallRecordsForPGPromise(
  calldata: CallRecord[],
): SaveableCallRecordFields[] {
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
