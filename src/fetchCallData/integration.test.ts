/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import fetchCallData from './routeHandlerCallback';

require('dotenv').config();

const mockRequest: Request = {
  body: {
    userName: process.env.VOIPMS_USERNAME,
    apiPassword: process.env.VOIPMS_API_PASSWORD,
    yearsBack: 3,
  },
} as Request;

const mockResponse = {
  // eslint-disable-next-line no-unused-vars
  status(statusCode) { return this; },
  json(data) { return JSON.parse(data); },
} as Response;

test('fetchCallData', async () => {
  // expect array length to be a certain length
  // before that check for the success key
  const callData = await fetchCallData(mockRequest, mockResponse);
  console.log('callData', callData);
}, 60000);

export {}; // isolatedModules workaround
