import { Request } from 'express';
import VoipMsProperties from '../interfaces/VoipMsProperties';
import isRequest from './isRequest';

function setVoipMsUserName(input: VoipMsProperties | Request) {
  let voipms_username: string;

  if (isRequest(input)) {
    voipms_username = input.body.voipms_username;
  } else {
    voipms_username = input.voipms_username;
  }

  return voipms_username;
}

export default setVoipMsUserName;
