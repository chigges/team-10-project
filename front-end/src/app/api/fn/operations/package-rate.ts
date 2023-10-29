/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { PackageId } from '../../models/package-id';
import { PackageRating } from '../../models/package-rating';

export interface PackageRate$Params {
  id: PackageId;
  'X-Authorization': AuthenticationToken;
}

export function packageRate(http: HttpClient, rootUrl: string, params: PackageRate$Params, context?: HttpContext): Observable<StrictHttpResponse<PackageRating>> {
  const rb = new RequestBuilder(rootUrl, packageRate.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Authorization', params['X-Authorization'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PackageRating>;
    })
  );
}

packageRate.PATH = '/package/{id}/rate';
