export default interface SaveableCallRecord {
  unique_id: string;
  caller_id: string;
  date: string;
  description: string;
  account: string;
  disposition: string;
  seconds: string;
  campaign_id: string;
}
