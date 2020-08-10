import { Router, Request, Response } from 'express';
import passportWithLocalStrategy from './setupLocalStrategy';
import sendUserIdAndNameAsJson from './routeHandlerCallback';

const router = Router();

const failureFlash = 'Invalid username or password.';

router.post(
  '/login',
  passportWithLocalStrategy.authenticate('local'),
  sendUserIdAndNameAsJson,
);

export default router;
