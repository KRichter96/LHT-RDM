import { Network } from '@ionic-native/network/ngx';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

export enum ConnectionStatus { Online, Offline }
//const PROJECT_URL = 'http://192.168.176.77:8081/api/projects';
const PROJECT_URL = 'http://192.168.2.55:8081/api/projects';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Online);

  constructor(private network: Network, private plt: Platform, private http: HttpClient) { 
    this.plt.ready().then(() => {
      //let status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      //this.status.next(ConnectionStatus.Offline);
      setInterval(() => { this.checkConnection() }, 3000);
    })
  }

  checkConnection() {
    this.http.get(PROJECT_URL).subscribe(
        data => { this.updateNetworkStatus(ConnectionStatus.Online, data) },
        error => { this.updateNetworkStatus(ConnectionStatus.Offline, error) }
    );
  }

  private async updateNetworkStatus(status: ConnectionStatus, msg: any) {
    this.status.next(status);
    //let connection = status == ConnectionStatus.Offline ? 'Offline' : 'Online';
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }
}
