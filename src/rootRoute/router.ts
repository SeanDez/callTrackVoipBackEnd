// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  const instructToChoseProperRoute = `You are on the root endpoint. Please use a path to a proper endpoint to receive a more request. Options:

/callData - POST
userName: string
apiPassword: string
yearsBack: number;

Returns array of call detail records
  `;

  /* eslint-disable no-console */
  console.log(instructToChoseProperRoute);
  res.status(200).send(instructToChoseProperRoute);
});

export default router;
