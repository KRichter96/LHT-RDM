import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  pwField: string;
  usField: string;
  

  constructor(private router: Router, private http: HttpClient, private toastService: ToastService) { }

  ngOnInit() {
  }

  login() {
    let credentials = {username: this.usField, password: this.pwField};
    this.http.post('http://192.168.40.125:8081/api/auth/login', credentials).subscribe(
      data =>  this.router.navigate(["projects"]) ,
      error =>  this.toastService.displayToast("Wrong password, please try again!")
    );
  }
}
