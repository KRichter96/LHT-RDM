import {Network} from '@ionic-native/network/ngx';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Platform} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '../toast/toast.service';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';
import {catchError, timeout} from 'rxjs/operators';
import {LogProvider} from '../logging/log.service';

export enum ConnectionStatus { Online, Offline }

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Online);
  private statusValue: number;

  constructor(private network: Network,
              private plt: Platform,
              private http: HttpClient,
              private toastCtrl: ToastService,
              private bupService: BackendUrlProviderService,
              private log: LogProvider) {
    // this.updateNetworkStatus(ConnectionStatus.Offline, '');

    this.plt.ready().then(() => {
      const status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
      this.statusValue = status;
      setInterval(() => { this.checkConnection(); }, 7500);
    });
  }

  checkConnection() {
    this.http.get(this.bupService.getUrl() + 'projects').pipe(
      timeout(7500),
        catchError(error => {
          this.updateNetworkStatus(ConnectionStatus.Offline, error).then();
          return of(null);
        }
      )).subscribe(
      data => {
        if (data === null) {
          this.updateNetworkStatus(ConnectionStatus.Offline, data).then();
        } else {
          this.updateNetworkStatus(ConnectionStatus.Online, data).then();
        }
      },
      error => { this.updateNetworkStatus(ConnectionStatus.Offline, error).then(); }
    );
  }

  private async updateNetworkStatus(status: ConnectionStatus, msg: any) {
    if (this.status.getValue() === ConnectionStatus.Online && status === ConnectionStatus.Offline) {
      this.toastCtrl.displayToast('You are now Offline');
      this.log.log('App is now offline.');
    } else if (this.status.getValue() === ConnectionStatus.Offline && status === ConnectionStatus.Online) {
      this.toastCtrl.displayToast('You are now Online');
      this.log.log('App is now online.');
    }
    // always emit status
    // this triggers and upload if the status is online and
    // if no upload is running currently
    this.status.next(status);
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue(); // status: 0: "Online", 1: "Offline"
  }
}
