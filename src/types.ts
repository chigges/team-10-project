/*types that we need according to the API spec*/



export interface User {

    /**
     * Is this user an admin?
     */
    isAdmin: boolean;
    name: string;
}

/**
 * Authentication info for a user
 */
export interface UserAuthenticationInfo {

    /**
     * Password for a user. Per the spec, this should be a "strong" password.
     */
    password: string;
}

export type SemverRange = string;

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

export interface Package {
    data: PackageData;
    metadata: PackageMetadata;
}

export interface PackageRegEx {

    /**
     * A regular expression over package names and READMEs that is
     * used for searching for a package
     */
    RegEx: string;
}

/**
 * Package rating (cf. Project 1).
 *
 * If the Project 1 that you inherited does not support one or more of the original properties, denote this with the value "-1".
 */
export interface PackageRating {
    BusFactor: number;
    Correctness: number;
  
    /**
     * The fraction of its dependencies that are pinned to at least a specific major+minor version, e.g. version 2.3.X of a package. (If there are zero dependencies, they should receive a 1.0 rating. If there are two dependencies, one pinned to this degree, then they should receive a Â½ = 0.5 rating).
     */
    GoodPinningPractice: number;
    LicenseScore: number;
  
    /**
     * Scores calculated from other seven metrics.
     */
    NetScore: number;
  
    /**
     * The fraction of project code that was introduced through pull
     * requests with a code review.
     */
    PullRequest: number;
    RampUp: number;
    ResponsiveMaintainer: number;
}

/**
 * Name of a package.
 *
 * - Names should only use typical "keyboard" characters.
 * - The name "*" is reserved. See the `/packages` API for its meaning.
 */
export type PackageName = string;

export interface PackageQuery {
    Name: PackageName;
    Version?: SemverRange;
}

export type PackageId = string;

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

/**
 * Offset in pagination.
 */
export type EnumerateOffset = string;

/**
 * The spec permits you to use any token format you like. You could for example, look into JSON Web Tokens ("JWT", pronounced "jots"): https://jwt.io.
 */
export type AuthenticationToken = string;

export interface AuthenticationRequest {
    Secret: UserAuthenticationInfo;
    User: User;
  }