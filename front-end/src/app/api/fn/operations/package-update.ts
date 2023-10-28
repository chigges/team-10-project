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

export interface PackageUpdate$Params {

/**
 * Package ID
 */
  id: PackageId;
  'X-Authorization': AuthenticationToken;
      body: Package
}

export function packageUpdate(http: HttpClient, rootUrl: string, params: PackageUpdate$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, packageUpdate.PATH, 'put');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Authorization', params['X-Authorization'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

packageUpdate.PATH = '/package/{id}';
