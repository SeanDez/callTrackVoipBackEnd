// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import sendLoginDetails from './routeHandlerCallback';

const router = Router();

router.post('/login', undefined, sendLoginDetails);

export default router;
