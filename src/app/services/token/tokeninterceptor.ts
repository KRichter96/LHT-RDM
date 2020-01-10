import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {TokenService} from './token.service';
import {Injectable, Injector} from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add token if this is not a retrieve-token request
    if (req.url.indexOf('/api/auth/login') === -1 ) {
      // read token from local/sessionStorage
      const token = this.tokenService.getToken();
      // Add auth header and token
      const modified = req.clone({setHeaders: {'Authorization': 'Bearer ' + token}});
      // send modified request
      return next.handle(modified);
    }
    // Retrieve token
    return next.handle(req);
  }
}