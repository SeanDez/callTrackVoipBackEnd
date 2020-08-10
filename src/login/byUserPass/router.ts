import { Router } from 'express';
import passportWithLocalStrategy from './setupLocalStrategy';

const router = Router();

router.post('/login', passportWithLocalStrategy.authenticate('local', { session: false }));

export default router;
