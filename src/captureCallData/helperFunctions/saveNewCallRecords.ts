import { optioned } from '../../shared/databaseConfig';
import CallRecord from '../interfaces/CallRecord';
import formatCallRecordsForPGPromise from './formatCallRecordsForPGPromise';

async function saveNewCallRecords(db: any, callData: CallRecord[]) {
  const callDataFormattedForInsert = formatCallRecordsForPGPromise(callData);
  const callColumns = new optioned.helpers.ColumnSet(['unique_id', 'caller_id', 'date', 'description', 'account', 'disposition', 'seconds', 'campaign_id']);
  const callTable = 'call';
  const callMultiInsertQuery = optioned.helpers.insert(
    callDataFormattedForInsert, callColumns, callTable,
  );
  try {
    await db.none(callMultiInsertQuery);
  } catch (error) {
    throw new Error(error);
  }
}

export default saveNewCallRecords;
