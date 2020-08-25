import { Request } from 'express';
import { VoipMsProperties } from "../interfaces/VoipMsProperties";

function isRequest(input: VoipMsProperties | Request): input is Request {
  return (input as Request).body !== 'undefined';
}

export default isRequest;
