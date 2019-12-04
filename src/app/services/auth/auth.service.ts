import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  constructor(public authentication: AuthenticationService) { }

  canActivate(): boolean {
    return this.authentication.isAuthentificated();
  }
}
