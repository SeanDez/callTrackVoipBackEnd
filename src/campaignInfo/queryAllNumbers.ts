export default (userName: string) => `SELECT number.number, campaign.name, campaign.status

FROM user

LEFT JOIN number
ON user.id = number.userId

LEFT JOIN campaign
ON campaign.id = number.campaignId

WHERE userName = ${userName}
`;
