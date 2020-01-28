import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  public token: any;

  constructor(private storage: Storage) { }

  getToken() {
    //return this.token;
    return this.storage.get('token');
  }

  setToken(token) {
    //this.token = token;
    this.storage.set('token', token);
  }
}
