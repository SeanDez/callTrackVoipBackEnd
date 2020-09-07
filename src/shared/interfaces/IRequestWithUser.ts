import { Request } from 'express';

export default interface RequestWithUser extends Request {
  user: {
    id?: string;
    user_name: string;
    password: string;
    voipms_user_email: string;
    voipms_password_encrypted: string;
  }
}
