/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { PackageMetadata } from '../../models/package-metadata';
import { PackageRegEx } from '../../models/package-reg-ex';

export interface PackageByRegExGet$Params {
  'X-Authorization': AuthenticationToken;
      body: PackageRegEx
}

export function packageByRegExGet(http: HttpClient, rootUrl: string, params: PackageByRegExGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PackageMetadata>>> {
  const rb = new RequestBuilder(rootUrl, packageByRegExGet.PATH, 'post');
  if (params) {
    rb.header('X-Authorization', params['X-Authorization'], {});
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

packageByRegExGet.PATH = '/package/byRegEx';
