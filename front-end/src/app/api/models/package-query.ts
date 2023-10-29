/* tslint:disable */
/* eslint-disable */
import { PackageName } from '../models/package-name';
import { SemverRange } from '../models/semver-range';
export interface PackageQuery {
  Name: PackageName;
  Version?: SemverRange;
}
