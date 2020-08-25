export default (userName: string) => `SELECT campaign.number, campaign.name, campaign.status
FROM user

LEFT JOIN campaign
ON user.id = campaign.user_id

WHERE userName = ${userName}
`;
