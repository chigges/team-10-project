/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationRequest } from '../../models/authentication-request';
import { AuthenticationToken } from '../../models/authentication-token';

export interface CreateAuthToken$Params {
      body: AuthenticationRequest
}

export function createAuthToken(http: HttpClient, rootUrl: string, params: CreateAuthToken$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthenticationToken>> {
  const rb = new RequestBuilder(rootUrl, createAuthToken.PATH, 'put');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AuthenticationToken>;
    })
  );
}

createAuthToken.PATH = '/authenticate';
