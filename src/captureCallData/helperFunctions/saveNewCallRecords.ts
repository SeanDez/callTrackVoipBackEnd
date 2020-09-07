import { optioned as pgOptioned } from '../../shared/databaseConfig';
import CallRecord from '../interfaces/CallRecord';
import formatCallRecordsForPGPromise from './formatCallRecordsForPGPromise';

async function saveNewCallRecords(db: any, callData: CallRecord[]): Promise<void> {
  const callDataFormattedForInsert = await formatCallRecordsForPGPromise(callData);
  const callColumns = new pgOptioned.helpers.ColumnSet(['unique_id', 'caller_id', 'date', 'description', 'account', 'disposition', 'seconds', 'campaign_id']);
  const callTable = 'call';
  const callMultiInsertSegment = pgOptioned.helpers.insert(
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
