import lodash from 'lodash';
import { CallRecord } from "../interfaces/CallRecord";
export function extractDestinationPhoneNumbers(callData: CallRecord[]) {
  const allPhoneNumbers = callData.map((record: CallRecord) => record.destination);
  const uniqueNumbers = lodash.uniq(allPhoneNumbers);
  return uniqueNumbers;
}
