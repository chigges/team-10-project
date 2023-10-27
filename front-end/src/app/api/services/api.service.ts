/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { AuthenticationToken } from '../models/authentication-token';
import { createAuthToken } from '../fn/operations/create-auth-token';
import { CreateAuthToken$Params } from '../fn/operations/create-auth-token';
import { Package } from '../models/package';
import { packageByNameDelete } from '../fn/operations/package-by-name-delete';
import { PackageByNameDelete$Params } from '../fn/operations/package-by-name-delete';
import { packageByNameGet } from '../fn/operations/package-by-name-get';
import { PackageByNameGet$Params } from '../fn/operations/package-by-name-get';
import { packageByRegExGet } from '../fn/operations/package-by-reg-ex-get';
import { PackageByRegExGet$Params } from '../fn/operations/package-by-reg-ex-get';
import { packageCreate } from '../fn/operations/package-create';
import { PackageCreate$Params } from '../fn/operations/package-create';
import { packageDelete } from '../fn/operations/package-delete';
import { PackageDelete$Params } from '../fn/operations/package-delete';
import { PackageHistoryEntry } from '../models/package-history-entry';
import { PackageMetadata } from '../models/package-metadata';
import { packageRate } from '../fn/operations/package-rate';
import { PackageRate$Params } from '../fn/operations/package-rate';
import { PackageRating } from '../models/package-rating';
import { packageRetrieve } from '../fn/operations/package-retrieve';
import { PackageRetrieve$Params } from '../fn/operations/package-retrieve';
import { packagesList } from '../fn/operations/packages-list';
import { PackagesList$Params } from '../fn/operations/packages-list';
import { packageUpdate } from '../fn/operations/package-update';
import { PackageUpdate$Params } from '../fn/operations/package-update';
import { registryReset } from '../fn/operations/registry-reset';
import { RegistryReset$Params } from '../fn/operations/registry-reset';

@Injectable({ providedIn: 'root' })
export class ApiService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `packagesList()` */
  static readonly PackagesListPath = '/packages';

  /**
   * Get the packages from the registry.
   *
   * Get any packages fitting the query.
   * Search for packages satisfying the indicated query.
   *
   * If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
   *
   * The response is paginated; the response header includes the offset to use in the next query.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packagesList()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packagesList$Response(params: PackagesList$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PackageMetadata>>> {
    return packagesList(this.http, this.rootUrl, params, context);
  }

  /**
   * Get the packages from the registry.
   *
   * Get any packages fitting the query.
   * Search for packages satisfying the indicated query.
   *
   * If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
   *
   * The response is paginated; the response header includes the offset to use in the next query.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packagesList$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packagesList(params: PackagesList$Params, context?: HttpContext): Observable<Array<PackageMetadata>> {
    return this.packagesList$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<PackageMetadata>>): Array<PackageMetadata> => r.body)
    );
  }

  /** Path part for operation `registryReset()` */
  static readonly RegistryResetPath = '/reset';

  /**
   * Reset the registry.
   *
   * Reset the registry to a system default state.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registryReset()` instead.
   *
   * This method doesn't expect any request body.
   */
  registryReset$Response(params: RegistryReset$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return registryReset(this.http, this.rootUrl, params, context);
  }

  /**
   * Reset the registry.
   *
   * Reset the registry to a system default state.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registryReset$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  registryReset(params: RegistryReset$Params, context?: HttpContext): Observable<void> {
    return this.registryReset$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `packageRetrieve()` */
  static readonly PackageRetrievePath = '/package/{id}';

  /**
   * Interact with the package with this ID.
   *
   * Return this package.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageRetrieve()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageRetrieve$Response(params: PackageRetrieve$Params, context?: HttpContext): Observable<StrictHttpResponse<Package>> {
    return packageRetrieve(this.http, this.rootUrl, params, context);
  }

  /**
   * Interact with the package with this ID.
   *
   * Return this package.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageRetrieve$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageRetrieve(params: PackageRetrieve$Params, context?: HttpContext): Observable<Package> {
    return this.packageRetrieve$Response(params, context).pipe(
      map((r: StrictHttpResponse<Package>): Package => r.body)
    );
  }

  /** Path part for operation `packageUpdate()` */
  static readonly PackageUpdatePath = '/package/{id}';

  /**
   * Update this content of the package.
   *
   * The name, version, and ID must match.
   *
   * The package contents (from PackageData) will replace the previous contents.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageUpdate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packageUpdate$Response(params: PackageUpdate$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return packageUpdate(this.http, this.rootUrl, params, context);
  }

  /**
   * Update this content of the package.
   *
   * The name, version, and ID must match.
   *
   * The package contents (from PackageData) will replace the previous contents.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageUpdate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packageUpdate(params: PackageUpdate$Params, context?: HttpContext): Observable<void> {
    return this.packageUpdate$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `packageDelete()` */
  static readonly PackageDeletePath = '/package/{id}';

  /**
   * Delete this version of the package.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageDelete$Response(params: PackageDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return packageDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * Delete this version of the package.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageDelete(params: PackageDelete$Params, context?: HttpContext): Observable<void> {
    return this.packageDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `packageCreate()` */
  static readonly PackageCreatePath = '/package';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageCreate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packageCreate$Response(params: PackageCreate$Params, context?: HttpContext): Observable<StrictHttpResponse<Package>> {
    return packageCreate(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageCreate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packageCreate(params: PackageCreate$Params, context?: HttpContext): Observable<Package> {
    return this.packageCreate$Response(params, context).pipe(
      map((r: StrictHttpResponse<Package>): Package => r.body)
    );
  }

  /** Path part for operation `packageRate()` */
  static readonly PackageRatePath = '/package/{id}/rate';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageRate()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageRate$Response(params: PackageRate$Params, context?: HttpContext): Observable<StrictHttpResponse<PackageRating>> {
    return packageRate(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageRate$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageRate(params: PackageRate$Params, context?: HttpContext): Observable<PackageRating> {
    return this.packageRate$Response(params, context).pipe(
      map((r: StrictHttpResponse<PackageRating>): PackageRating => r.body)
    );
  }

  /** Path part for operation `createAuthToken()` */
  static readonly CreateAuthTokenPath = '/authenticate';

  /**
   * Create an access token.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createAuthToken()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createAuthToken$Response(params: CreateAuthToken$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthenticationToken>> {
    return createAuthToken(this.http, this.rootUrl, params, context);
  }

  /**
   * Create an access token.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createAuthToken$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createAuthToken(params: CreateAuthToken$Params, context?: HttpContext): Observable<AuthenticationToken> {
    return this.createAuthToken$Response(params, context).pipe(
      map((r: StrictHttpResponse<AuthenticationToken>): AuthenticationToken => r.body)
    );
  }

  /** Path part for operation `packageByNameGet()` */
  static readonly PackageByNameGetPath = '/package/byName/{name}';

  /**
   * Return the history of this package (all versions).
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageByNameGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageByNameGet$Response(params: PackageByNameGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PackageHistoryEntry>>> {
    return packageByNameGet(this.http, this.rootUrl, params, context);
  }

  /**
   * Return the history of this package (all versions).
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageByNameGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageByNameGet(params: PackageByNameGet$Params, context?: HttpContext): Observable<Array<PackageHistoryEntry>> {
    return this.packageByNameGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<PackageHistoryEntry>>): Array<PackageHistoryEntry> => r.body)
    );
  }

  /** Path part for operation `packageByNameDelete()` */
  static readonly PackageByNameDeletePath = '/package/byName/{name}';

  /**
   * Delete all versions of this package.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageByNameDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageByNameDelete$Response(params: PackageByNameDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return packageByNameDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * Delete all versions of this package.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageByNameDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  packageByNameDelete(params: PackageByNameDelete$Params, context?: HttpContext): Observable<void> {
    return this.packageByNameDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `packageByRegExGet()` */
  static readonly PackageByRegExGetPath = '/package/byRegEx';

  /**
   * Get any packages fitting the regular expression.
   *
   * Search for a package using regular expression over package names
   * and READMEs. This is similar to search by name.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `packageByRegExGet()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packageByRegExGet$Response(params: PackageByRegExGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PackageMetadata>>> {
    return packageByRegExGet(this.http, this.rootUrl, params, context);
  }

  /**
   * Get any packages fitting the regular expression.
   *
   * Search for a package using regular expression over package names
   * and READMEs. This is similar to search by name.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `packageByRegExGet$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  packageByRegExGet(params: PackageByRegExGet$Params, context?: HttpContext): Observable<Array<PackageMetadata>> {
    return this.packageByRegExGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<PackageMetadata>>): Array<PackageMetadata> => r.body)
    );
  }

}
