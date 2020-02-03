import {Injectable} from '@angular/core';
import {ToastService} from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class BackendUrlProviderService {

  private url = 'https://plm4.ham.dlh.de:17081/api/';
  //private url = 'http://192.168.43.11:8081/api/';
  private defaultUrl = 'https://plm4.ham.dlh.de:17081/api/';
  //private defaultUrl = 'http://192.168.43.11:8081/api/';

  constructor(private toastService: ToastService) {}

  setUrl(url: string): void {

    if (!this.isInFormat(url)) {
      this.toastService.displayToast('URL is faulty. Using default url.');
      return;
    }
    this.url = url;
  }

  getUrl(): string {
    return this.url;
  }

  isInFormat(url: string): boolean {
    return /(http[s]?:\/\/[a-zA-Z0-9.]+:[0-9]+\/api\/)/g.test(url);
  }

  resetUrl(): void {
    this.url = this.defaultUrl;
  }
}
