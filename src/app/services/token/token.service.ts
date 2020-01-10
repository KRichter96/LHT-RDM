import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private storage: Storage) { }

  getToken() {
    return this.storage.get('token');
  }

  setToken(token) {
    this.storage.set('token', token);
  }
}
