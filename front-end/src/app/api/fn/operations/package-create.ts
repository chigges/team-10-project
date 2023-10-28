/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { Package } from '../../models/package';
import { PackageData } from '../../models/package-data';

export interface PackageCreate$Params {
  'X-Authorization': AuthenticationToken;
      body: PackageData
}

export function packageCreate(http: HttpClient, rootUrl: string, params: PackageCreate$Params, context?: HttpContext): Observable<StrictHttpResponse<Package>> {
  const rb = new RequestBuilder(rootUrl, packageCreate.PATH, 'post');
  if (params) {
    rb.header('X-Authorization', params['X-Authorization'], {});
    rb.body(params.body, 'application/json');
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

packageCreate.PATH = '/package';
