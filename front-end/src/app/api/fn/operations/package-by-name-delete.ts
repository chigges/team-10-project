/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthenticationToken } from '../../models/authentication-token';
import { PackageName } from '../../models/package-name';

export interface PackageByNameDelete$Params {
  name: PackageName;
  'X-Authorization': AuthenticationToken;
}

export function packageByNameDelete(http: HttpClient, rootUrl: string, params: PackageByNameDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, packageByNameDelete.PATH, 'delete');
  if (params) {
    rb.path('name', params.name, {});
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

packageByNameDelete.PATH = '/package/byName/{name}';
