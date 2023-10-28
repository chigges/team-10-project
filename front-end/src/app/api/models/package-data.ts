/* tslint:disable */
/* eslint-disable */

/**
 * This is a "union" type.
 * - On package upload, either Content or URL should be set. If both are set, returns 400.
 * - On package update, exactly one field should be set.
 * - On download, the Content field should be set.
 */
export interface PackageData {

  /**
   * Package contents. This is the zip file uploaded by the user. (Encoded as text using a Base64 encoding).
   *
   * This will be a zipped version of an npm package's GitHub repository, minus the ".git/" directory." It will, for example, include the "package.json" file that can be used to retrieve the project homepage.
   *
   * See https://docs.npmjs.com/cli/v7/configuring-npm/package-json#homepage.
   */
  Content?: string;

  /**
   * A JavaScript program (for use with sensitive modules).
   */
  JSProgram?: string;

  /**
   * Package URL (for use in public ingest).
   */
  URL?: string;
}
