import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class AuthService {
      private scope: string;

      constructor() {}

      canWrite(): boolean {
          return true
          return this.scope.toLocaleLowerCase().includes('write');
      }

      setScope(token: string): void {
          const claims = JSON.parse(atob(token.split('.')[1]));
          this.scope = claims.scope;
      }
  }
