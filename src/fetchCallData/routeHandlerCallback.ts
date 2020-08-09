import 'es6-promise';
import 'isomorphic-fetch';
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import moment from 'moment';

interface VoipMsProperties {
  userName: string,
  apiPassword: string,
  yearsBack: string
}

// eslint-disable-next-line
async function fetchCallData(req: Request, res: Response) {
  const { userName, apiPassword, yearsBack }
  : VoipMsProperties = req.body;

  const apiMethod = 'getCDR';
  const startDate = moment().subtract(yearsBack, 'years').format('YYYY[-]MM[-]DD');
  const endDate = moment().format('YYYY[-]MM[-]DD'); // now
  const timeZone = -5;

  const requestUrl = `http://voip.ms/api/v1/rest.php?api_username=${userName}&api_password=${apiPassword}&method=${apiMethod}&date_from=${startDate}&date_to=${endDate}&timezone${timeZone}`;

  try {
    const response = await fetch(requestUrl, {
      headers: {
        'content-type': 'application/json',
      },
      mode: 'cors',
      method: 'get',
    });

    if (response.ok) {
      const jsonData = await response.json();
      return res.status(200).json(jsonData);
    }

    throw new Error('fetchCallData, response.ok was falsy');
  } catch (error) {
    throw new Error(error);
  }
}

export default fetchCallData;
