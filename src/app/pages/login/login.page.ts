import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { TokenService } from 'src/app/services/token/token.service';
import { API_IP } from './../../../environments/environment';


const PART_URL = API_IP + 'parts/byProject/';
const UPDATE_PART_URL = API_IP + 'parts';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  pwField: string;
  usField: string;

  constructor(private router: Router, private http: HttpClient, private toastService: ToastService,
              private tokensSrvice: TokenService, private authService: AuthService) { }

  ngOnInit() {
    this.tokensSrvice.setToken('');
    this.http.get(`${PART_URL + '1'}`).subscribe((res) =>
      console.log(res)
    );
  }

  login() {
    const credentials = {username: this.usField, password: this.pwField};
    this.http.post(API_IP + 'auth/login', credentials).subscribe(
      (data: any) => {
        this.tokensSrvice.setToken(data.token);
        this.authService.setScope(data.token);
        this.router.navigate(['projects']);
      },
      error =>  this.toastService.displayToast('Wrong password, please try again!')
    );
  }
}
