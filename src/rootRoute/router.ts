// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const instructToChooseProperRoute = `You are on the root endpoint.`;

  /* eslint-disable no-console */
  console.log(instructToChooseProperRoute);
  console.log('This statement ONLY prints to the console.');
  res.status(200).json({ message: 'the connection works' });
});

export default router;
