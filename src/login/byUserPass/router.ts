import { Router, Request, Response, NextFunction } from 'express';
import passportWithLocalStrategy from '../../passport/setupLocalStrategy';
import respondWithUserData from './routeHandlerCallback';
import IRequestWithUser from '../../shared/interfaces/IRequestWithUser';

const router = Router();

// pass back all data except id
// id, user_name, voipms_user_email, voipms_password_encrypted
router.post(
  '/login',
  passportWithLocalStrategy.authenticate('local'),
  respondWithUserData,
);

/*
  204 response means user is logged int a session
  401 means not logged in.
*/
router.get('/authCheck', (req: Request, res: Response, next: NextFunction) => {
  const hasValidSession = req.isAuthenticated();
  console.log('req.session', req.session);
  console.log('session.id', req.session!.id);
  console.log('sessionID', req.sessionID);

  console.log('hasValidSession: ', hasValidSession);

  res.status(204).send();
});

/*
  checks for cookies without having to pass authentication first
*/
router.get('/cookieCheck', (req: Request, res: Response) => {
  console.log('Cookies: ', req.cookies);
  console.log('Session', req.session);

  res.status(200).json({
    cookies: req.cookies,
    session: req.session,
    sessionID: req.sessionID,
  });
});

export default router;
