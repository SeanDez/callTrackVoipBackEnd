import { Request } from 'express';
import ILocalLoginDetails from '../interfaces/ILocalLoginDetails';

function isRequest(input: ILocalLoginDetails | Request): input is Request {
  return typeof input.body !== 'undefined';
}

export default isRequest;
