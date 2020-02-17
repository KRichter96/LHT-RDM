import {Injectable} from '@angular/core';
import {ToastService} from '../toast/toast.service';
import {Storage} from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class BackendUrlProviderService {

  private URL_KEY = 'URL_KEY';

  private url;
  private defaultUrl = 'https://3dspace.ham.dlh.de:27081/api/';
  // private url = 'http://192.168.43.228:8081/api/';
  // private defaultUrl = 'http://192.168.43.228:8081/api/';

  constructor(private toastService: ToastService,
              private storage: Storage) {}

  initUrl(): Promise<string> {
    return this.storage.get(this.URL_KEY).then(url => {
      if (url && this.isInFormat(url)) {
        this.url = url;
        return url;
      } else {
        this.url = this.defaultUrl;
        this.storage.set(this.URL_KEY, this.defaultUrl);
        return this.defaultUrl;
      }
    }, () => {
      this.storage.set(this.URL_KEY, this.defaultUrl);
      return this.defaultUrl;
    });
  }

  setUrl(url: string): void {

    if (!this.isInFormat(url)) {
      this.toastService.displayToast('URL is faulty. Using default url.');
      return;
    }
    this.url = url;
    this.storage.set(this.URL_KEY, this.url);
  }

  getUrl(): string {
    if (this.url) {
      return this.url;
    }

    return this.defaultUrl;
  }

  isInFormat(url: string): boolean {
    return /(http[s]?:\/\/[a-zA-Z0-9.]+:[0-9]+\/api\/)/g.test(url);
  }

  resetToDefault(): string {
    this.url = this.defaultUrl;
    return this.url;
  }
}
