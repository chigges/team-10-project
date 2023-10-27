/* tslint:disable */
/* eslint-disable */

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
