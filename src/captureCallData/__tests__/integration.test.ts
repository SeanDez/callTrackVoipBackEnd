/* eslint-disable no-undef */
import fetch from 'jest-fetch-mock';

// import the target class
// target specific internals for spying
// see (expect) what the spies return - .toHaveReturnedWith(value)

jest.mock('fs');
// jest.mock('isomorphic-fetch');
const fs = require('fs');
// require('es6-promise');
// require('isomorphic-fetch');

const mockConfigLevel = {
  none: jest.fn(() => 'mockPGP none value'),
  one: jest.fn(() => 'mockPGP one value'),
};

const mockOptionsLevel = () => mockConfigLevel;

const rootLevel = () => mockOptionsLevel;

jest.mock('pg-promise', () => () => mockConfigLevel);
const pgp = require('pg-promise');

test.skip('test fs.specialMethod', () => {
  const result = fs.specialMethod();
});

function useFsInternally(fakeFileName: string) {
  return fs.readdirSync(fakeFileName);
}

test.skip('test mocking functionality', () => {
  const result: string = useFsInternally('testInput');

  expect(result).toStrictEqual('wrong value');
});

test('text mock fetch module', async () => {
  fetch.mockResponseOnce(JSON.stringify({ data: 'test value' }));
  const response = await fetch('http://test.com');

  expect(await response.json()).toEqual({ data: 'test value' });
});

// test('AsyncCallData', async () => {
//   const asyncCallData = new AsyncCallData();
//   // await asyncCallData.initializeAsyncValues();
// });
