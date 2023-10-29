/* tslint:disable */
/* eslint-disable */
import { PackageId } from '../models/package-id';
import { PackageName } from '../models/package-name';

/**
 * The "Name" and "Version" are used as a unique identifier pair when uploading a package.
 *
 * The "ID" is used as an internal identifier for interacting with existing packages.
 */
export interface PackageMetadata {

  /**
   * Unique ID for use with the /package/{id} endpoint.
   */
  ID: PackageId;

  /**
   * Package name
   */
  Name: PackageName;

  /**
   * Package version
   */
  Version: string;
}
