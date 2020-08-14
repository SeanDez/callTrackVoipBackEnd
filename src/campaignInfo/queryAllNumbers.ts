export default (userName: string) => `SELECT campaign.number, campaign.name, campaign.status
FROM user

LEFT JOIN campaign
ON user.id = campaign.userId

WHERE userName = ${userName}
`;
