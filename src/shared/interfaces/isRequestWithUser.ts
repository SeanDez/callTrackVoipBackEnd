import ILocalLoginDetails from '../../captureCallData/interfaces/ILocalLoginDetails';
import IRequestWithUser from '../../captureCallData/interfaces/IRequestWithUser';

function isRequest(input: ILocalLoginDetails | IRequestWithUser): input is IRequestWithUser {
  return typeof input.user !== 'undefined';
}

export default isRequest;
