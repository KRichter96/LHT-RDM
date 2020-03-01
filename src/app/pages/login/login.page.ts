import {AuthService} from '../../services/auth/auth.service';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ToastService} from 'src/app/services/toast/toast.service';
import {HttpClient} from '@angular/common/http';
import {TokenService} from 'src/app/services/token/token.service';
import {BackendUrlProviderService} from '../../services/backend-url-provider/backend-url-provider.service';
import {VERSION_NUMBER} from '../../app.component';
import {ProjectService} from '../../services/project/project.service';
import {LoginCredentials} from '../../models/login/login';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  version: string;

  pwField = '';
  usField = '';
  urlField: string;

  showUrl = false;

  constructor(private router: Router, private http: HttpClient, private toastService: ToastService,
              private tokensSrvice: TokenService, private authService: AuthService,
              private bupService: BackendUrlProviderService, private projectService: ProjectService) {
    this.bupService.initUrl().then(url => this.urlField = url);
    this.version = VERSION_NUMBER;
  }

  ngOnInit() {
    this.tokensSrvice.setToken('').then();
  }

  login() {
    this.bupService.setUrl(this.urlField);

    const credentials: LoginCredentials = {username: this.usField, password: this.pwField};
    this.tokensSrvice.login(credentials).then(() => {
      this.projectService.getProjectsAfterLogin().subscribe(() => {
        this.router.navigate(['projects']).then();
      });
    });
  }

  triggerUrl(): void {
    this.showUrl = !this.showUrl;
    if (!this.showUrl) {
      this.urlField = this.bupService.getUrl();
    }
  }

  resetToDefault() {
    this.urlField = this.bupService.resetToDefault();
  }
}
