// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  const instructToChooseProperRoute = `You are on the root endpoint. Please use a path to a proper endpoint to receive a more request. Options:

/callData - POST
userName: string
apiPassword: string

Returns array of call detail records
  `;

  await fetch('null');

  /* eslint-disable no-console */
  console.log(instructToChooseProperRoute);
  console.log('This statement ONLY prints to the console.');
  res.status(200).send(instructToChooseProperRoute);
});

export default router;
