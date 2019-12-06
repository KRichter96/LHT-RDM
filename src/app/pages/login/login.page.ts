import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsPage } from '../projects/projects.page';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { ToastController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  pwField: string;

  constructor(private router: Router, private authService: AuthenticationService, private toastCtrl: ToastController,
    private toastService: ToastService) { }

  ngOnInit() {
  }

  login() {
    //this.authService.login();
    if (this.pwField == "vmod") {
      this.router.navigate(["projects"]);
    }
    else {
      this.toastService.displayToast("Wrong password, please try again!")
    }
  }
}
