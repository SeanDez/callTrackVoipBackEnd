import { PGPromiseOptions } from '../shared/databaseConfig';
import { CallRecord } from './function';
import { formatCallRecordsForPGPromise } from "./helperFunctions/formatCallRecordsForPGPromise";
export async function saveNewCallRecords(db: any, callData: CallRecord[]) {
  const callDataFormattedForInsert = formatCallRecordsForPGPromise(callData);
  const callColumns = new PGPromiseOptions.helpers.ColumnSet(['uniqueId', 'callerId', 'date', 'description', 'account', 'disposition', 'seconds', 'campaign_phoneNumber']);
  const callTable = 'call';
  const callMultiInsertQuery = PGPromiseOptions.helpers.insert(
    callDataFormattedForInsert, callColumns, callTable);
  try {
    await db.none(callMultiInsertQuery);
  }
  catch (error) {
    throw new Error(error);
  }
}
