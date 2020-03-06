import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {IonicStorageModule, Storage} from '@ionic/storage';
import {Network} from '@ionic-native/network/ngx';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';
import {Camera} from '@ionic-native/camera/ngx';
import {File} from '@ionic-native/file/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';
import {WebView} from '@ionic-native/ionic-webview/ngx';

import {PartsPageModule} from './pages/parts/parts.module';
import {PartDetailPageModule} from './pages/part-detail/part-detail.module';
import {PopoverPageModule} from './component/popover/popover.module';

import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {TokenInterceptor} from './services/token/tokeninterceptor';
import {ObservableQService} from './services/observable-q/observable-q.service';
import {StorageHelperService} from './services/storage-helper/storage-helper.service';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    PartsPageModule,
    PartDetailPageModule,
    PopoverPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    Network,
    BarcodeScanner, // { provide: BarcodeScanner, useClass: BarcodeScannerMock}, // BarcodeScanner,
    Camera, // { provide: Camera, useClass: CameraMock }, // Camera,
    File,
    FilePath,
    WebView,
    PhotoViewer,
    ObservableQService,
    StorageHelperService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
