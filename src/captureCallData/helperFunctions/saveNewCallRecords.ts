import { optioned } from '../../shared/databaseConfig';
import CallRecord from '../interfaces/CallRecord';
import formatCallRecordsForPGPromise from './formatCallRecordsForPGPromise';

async function saveNewCallRecords(db: any, callData: CallRecord[]) {
  const callDataFormattedForInsert = await formatCallRecordsForPGPromise(callData);
  const callColumns = new optioned.helpers.ColumnSet(['unique_id', 'caller_id', 'date', 'description', 'account', 'disposition', 'seconds', 'campaign_id']);
  const callTable = 'call';
  const callMultiInsertSegment = optioned.helpers.insert(
    callDataFormattedForInsert, callColumns, callTable,
  );
  const conflictSegment = 'ON CONFLICT (unique_id) DO NOTHING';
  const fullQuery = `${callMultiInsertSegment} ${conflictSegment}`;

  try {
    await db.none(fullQuery);
  } catch (error) {
    throw new Error(error);
  }
}

export default saveNewCallRecords;
