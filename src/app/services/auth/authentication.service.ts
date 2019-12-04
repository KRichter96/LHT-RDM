import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Platform, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authState = new BehaviorSubject(false);

  constructor(private router: Router, private storage: Storage, private plt: Platform, public toastCtrl: ToastController) { 
    this.plt.ready().then(() => {
      this.ifLoggedIn();
    });
  }

  ifLoggedIn() {
    this.storage.get('USER_INFO').then((res) => {
      if (res) {
        this.authState.next(true);
      }
    });
  }

  login() {
    var dummy_response = {
      user_id: "1001",
      user_name: "test"
    };
    this.storage.set("USER_INFO", dummy_response).then(() => {
      this.router.navigate(["projects"]);
      this.authState.next(false);
    });
  }

  logout() {
    this.storage.remove("USER_INFO").then(() => {
      this.router.navigate(["login"]);
      this.authState.next(false);
    });
  }

  isAuthentificated() {
    return this.authState.value;
  }
}
