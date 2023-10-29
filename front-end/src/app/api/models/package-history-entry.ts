/* tslint:disable */
/* eslint-disable */
import { PackageMetadata } from '../models/package-metadata';
import { User } from '../models/user';

/**
 * One entry of the history of this package.
 */
export interface PackageHistoryEntry {
  Action: 'CREATE' | 'UPDATE' | 'DOWNLOAD' | 'RATE';

  /**
   * Date of activity using ISO-8601 Datetime standard in UTC format.
   */
  Date: string;
  PackageMetadata: PackageMetadata;
  User: User;
}
