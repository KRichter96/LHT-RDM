import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';
import {ToastService} from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  constructor(private plt: Platform,
              private barcodeScanner: BarcodeScanner,
              private toastService: ToastService) { }

  public scanPartIdentTag(): any {
    if (this.plt.is('android') || this.plt.is('ios') || this.plt.is('cordova')) {  // FIX HERE
        this.barcodeScanner.scan().then(barcodeData => {
        return barcodeData.text;
      });
    } else {
      this.toastService.displayToast('Works only on a device.');
      return;
    }

  }
}
