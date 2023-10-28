/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { PackageId } from '../../models/package-id';

export interface PackageDelete$Params {

/**
 * Package ID
 */
  id: PackageId;
  'X-Authorization': AuthenticationToken;

}

export function packageDelete(http: HttpClient, rootUrl: string, params: PackageDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, packageDelete.PATH, 'delete');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Authorization', params['X-Authorization'], {});
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

packageDelete.PATH = '/package/{id}';
