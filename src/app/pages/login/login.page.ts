import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsPage } from '../projects/projects.page';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  pwField: string;

  constructor(private router: Router, private authService: AuthenticationService, private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  login() {
    if (this.pwField == "Rm2020") {
      this.router.navigate(["projects"]);
    }
    else {
      let toast = this.toastCtrl.create({
        message: "Wrong Password, please try again!",
        duration: 3000,
        position: "bottom"
      });
      toast.then(toast => toast.present());
    }
  }
/*
  login() {
    this.authService.login();
  }
*/
}
