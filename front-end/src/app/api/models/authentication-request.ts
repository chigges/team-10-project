/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
import { UserAuthenticationInfo } from '../models/user-authentication-info';
export interface AuthenticationRequest {
  Secret: UserAuthenticationInfo;
  User: User;
}
