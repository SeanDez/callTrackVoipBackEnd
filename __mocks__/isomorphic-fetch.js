/* eslint-disable no-undef */
const fetch = jest.createMockFromModule('isomorphic-fetch');

fetch.mockImplementation(() => Promise.resolve('test resolved value'));

module.exports = fetch;
