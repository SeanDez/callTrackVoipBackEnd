import { Request } from 'express';
import { VoipMsProperties } from "../interfaces/VoipMsProperties";
import { isRequest } from "./isRequest";
export function setUserName(input: VoipMsProperties | Request) {
  let userName: string;

  if (isRequest(input)) {
    userName = input.body.userName;
  }
  else {
    userName = input.userName;
  }

  return userName;
}
