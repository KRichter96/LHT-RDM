import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  constructor(private plt: Platform, private barcodeScanner: BarcodeScanner, private toastCtrl: ToastController) { }

  public scanPartIdentTag(): any {
    if (this.plt.is("android") || this.plt.is("ios") || this.plt.is("cordova")) {  // FIX HERE
        this.barcodeScanner.scan().then(barcodeData => {
        return barcodeData.text;
      })
    }
    else {
      let toast = this.toastCtrl.create({
        message: "This will only work on a device!",
        duration: 3000,
        position: "bottom"
      });
      return toast.then(toast => toast.present());
    }

  }
}
