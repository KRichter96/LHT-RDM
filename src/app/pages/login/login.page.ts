import {AuthService} from './../../services/auth/auth.service';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ToastService} from 'src/app/services/toast/toast.service';
import {HttpClient} from '@angular/common/http';
import {TokenService} from 'src/app/services/token/token.service';
import {BackendUrlProviderService} from '../../services/backend-url-provider/backend-url-provider.service';
import {VERSION_NUMBER} from '../../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  version: string;

  pwField: string;
  usField: string;
  urlField: string;

  showUrl = false;

  constructor(private router: Router, private http: HttpClient, private toastService: ToastService,
              private tokensSrvice: TokenService, private authService: AuthService,
              private backendUrlProviderService: BackendUrlProviderService) {
    this.urlField = this.backendUrlProviderService.getUrl();
    this.version = VERSION_NUMBER;
  }

  ngOnInit() {
    this.tokensSrvice.setToken('');
  }

  login() {
    const credentials = {username: this.usField, password: this.pwField};
    this.backendUrlProviderService.setUrl(this.urlField);
    this.http.post(this.backendUrlProviderService.getUrl() + 'auth/login', credentials).subscribe(
      (data: any) => {
        this.tokensSrvice.setToken(data.token);
        this.authService.setScope(data.token);
        this.router.navigate(['projects']);
      },
      error =>  this.toastService.displayToast('Wrong password, please try again!')
    );
  }

  triggerUrl(): void {
    this.showUrl = !this.showUrl;
    if (!this.showUrl) {
      this.backendUrlProviderService.resetUrl();
      this.urlField = this.backendUrlProviderService.getUrl();
    }
  }
}
