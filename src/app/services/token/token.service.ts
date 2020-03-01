import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {HttpClient} from '@angular/common/http';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';
import {LoginCredentials} from '../../models/login/login';
import {AuthService} from '../auth/auth.service';
import {ProjectService} from '../project/project.service';
import {Router} from '@angular/router';
import {ToastService} from '../toast/toast.service';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  // TODO - renew token instead of redirecting to /login
  // TODO   this needs credentials in localstorage or 'renewtoken' (allows renewing token in backend without credentials)

  public token: any;
  private jwtHelperService = new JwtHelperService();

  constructor(private storage: Storage,
              private http: HttpClient,
              private bupService: BackendUrlProviderService,
              private authService: AuthService,
              private projectService: ProjectService,
              private router: Router,
              private toastService: ToastService) { }

  getToken(): Promise<string> {
    // load token from storage
    return this.storage.get('token').then((t) => {

      // if token is expired redirect to /login (if current page is not login)
      if (t === null || t === undefined || this.jwtHelperService.isTokenExpired(t)) {
        if (!this.router.url.endsWith('/login')) {
          this.router.navigate(['login']).then();
          return '';
        }
      }

      // token is ok, return token
      return t;
    });
  }

  setToken(token): Promise<void> {
    return this.storage.set('token', token);
  }

  login(credentials: LoginCredentials): Promise<void> {
    return this.http.post(this.bupService.getUrl() + 'auth/login', credentials).toPromise().then(
      (data: any) => {
        this.setToken(data.token).then();
        this.authService.setScope(data.token);
        return;
      },
      () =>  {
        this.toastService.displayToast('Something went wrong!');
        return;
      }
    );
  }
}
