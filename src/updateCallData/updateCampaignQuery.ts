export default (
  userId: string,
  columnName: string,
  newValue: string,
) => `UPDATE campaign
SET ${columnName} = ${newValue}
WHERE userId = ${userId}`;
