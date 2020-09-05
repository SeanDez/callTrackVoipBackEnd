import { Router, Request, Response } from 'express';
import passportWithLocalStrategy from './setupLocalStrategy';
import respondWithUserData from './routeHandlerCallback';

const router = Router();

// id, user_name, voipms_user_email, voipms_password_encrypted
// pass back all data except id
router.post(
  '/login',
  passportWithLocalStrategy.authenticate('local'),
  respondWithUserData,
);

export default router;
