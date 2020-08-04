export default (userName: string) => `SELECT id, userName
FROM user
WHERE userName = ${userName}

LEFT JOIN number
ON user.id = number.userId

LEFT JOIN campaign
ON campaign.id = number.campaignId
`;
