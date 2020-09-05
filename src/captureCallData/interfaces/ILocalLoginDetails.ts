import { Request } from 'express';

export default interface ILocalLoginDetails extends Request {
  localUserName: string;
  localPassword: string;
};
