/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { Package } from '../../models/package';
import { PackageId } from '../../models/package-id';

export interface PackageRetrieve$Params {

/**
 * Package ID
 */
  id: PackageId;
  'X-Authorization': AuthenticationToken;

}

export function packageRetrieve(http: HttpClient, rootUrl: string, params: PackageRetrieve$Params, context?: HttpContext): Observable<StrictHttpResponse<Package>> {
  const rb = new RequestBuilder(rootUrl, packageRetrieve.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Authorization', params['X-Authorization'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Package>;
    })
  );
}

packageRetrieve.PATH = '/package/{id}';
