export default (userName: string) => `SELECT id 
FROM user
WHERE userName = ${userName}
`;
