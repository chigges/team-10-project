/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { EnumerateOffset } from '../../models/enumerate-offset';
import { PackageMetadata } from '../../models/package-metadata';
import { PackageQuery } from '../../models/package-query';

export interface PackagesList$Params {
  'X-Authorization': AuthenticationToken;

/**
 * Provide this for pagination. If not provided, returns the first page of results.
 */
  offset?: EnumerateOffset;
      body: Array<PackageQuery>
}

export function packagesList(http: HttpClient, rootUrl: string, params: PackagesList$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PackageMetadata>>> {
  const rb = new RequestBuilder(rootUrl, packagesList.PATH, 'post');
  if (params) {
    rb.header('X-Authorization', params['X-Authorization'], {});
    rb.query('offset', params.offset, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<PackageMetadata>>;
    })
  );
}

packagesList.PATH = '/packages';
