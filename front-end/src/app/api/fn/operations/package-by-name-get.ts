/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { PackageHistoryEntry } from '../../models/package-history-entry';
import { PackageName } from '../../models/package-name';

export interface PackageByNameGet$Params {
  name: PackageName;
  'X-Authorization': AuthenticationToken;
}

export function packageByNameGet(http: HttpClient, rootUrl: string, params: PackageByNameGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PackageHistoryEntry>>> {
  const rb = new RequestBuilder(rootUrl, packageByNameGet.PATH, 'get');
  if (params) {
    rb.path('name', params.name, {});
    rb.header('X-Authorization', params['X-Authorization'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<PackageHistoryEntry>>;
    })
  );
}

packageByNameGet.PATH = '/package/byName/{name}';
