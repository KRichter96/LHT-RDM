import {Network} from '@ionic-native/network/ngx';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Platform} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '../toast/toast.service';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';

export enum ConnectionStatus { Online, Offline }

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Online);
  projectUrl: string;

  constructor(private network: Network, private plt: Platform, private http: HttpClient,
              private toastCtrl: ToastService, private backendUrlProviderService: BackendUrlProviderService) {
    this.projectUrl = this.backendUrlProviderService.getUrl() + 'projects';

    this.plt.ready().then(() => {
      const status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
      setInterval(() => { this.checkConnection(); }, 3000);
    });
  }

  checkConnection() {
    this.http.get(this.projectUrl).subscribe(
        data => { this.updateNetworkStatus(ConnectionStatus.Online, data); },
        error => { this.updateNetworkStatus(ConnectionStatus.Offline, error); }
    );
  }

  private async updateNetworkStatus(status: ConnectionStatus, msg: any) {
    if (this.status.getValue() === ConnectionStatus.Online && status === ConnectionStatus.Offline) {
      this.toastCtrl.displayToast('You are now Offline');
    } else if (this.status.getValue() === ConnectionStatus.Offline && status === ConnectionStatus.Online) {
      this.toastCtrl.displayToast('You are now Online');
    }
    this.status.next(status);
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue(); // status: 0: "Online", 1: "Offline"
  }
}
