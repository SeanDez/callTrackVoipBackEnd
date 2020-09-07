import { Router, Response } from 'express';
import passport from 'passport';
import respondWithUserData from './routeHandlerCallback';
import IRequestWithUser from '../../shared/interfaces/IRequestWithUser';

const router = Router();

// pass back all data except id
// id, user_name, voipms_user_email, voipms_password_encrypted
router.post(
  '/login',
  passport.authenticate('local'),
  respondWithUserData,
);

/*
  204 response means user is logged int a session
  401 means not logged in.
*/
router.get('/authCheck', passport.authenticate('local', (req: IRequestWithUser, res: Response) => {
  res.status(204).send();
}));

export default router;
