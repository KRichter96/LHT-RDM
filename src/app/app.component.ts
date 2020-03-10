import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import {ConnectionStatus, NetworkService} from './services/network/network.service';
import {OfflineService} from './services/offline/offline.service';
import {LogProvider} from './services/logging/log.service';

export const VERSION_NUMBER = '1.6.0';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private networkService: NetworkService,
    private offlineManager: OfflineService,
    private log: LogProvider) {
    this.initializeApp();

    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        // TODO does this trigger uploads multiple times or is the 'isCurrentlyUpload'
        // TODO value in storage working?
        this.offlineManager.checkForEvents();
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.log.init({
        totalLogSize: 50000000,
      }).then();
    });
  }
}
