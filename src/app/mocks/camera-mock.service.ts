import { BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner/ngx';
import {Camera} from '@ionic-native/camera/ngx';

export class CameraMock extends Camera {

    getPicture(options) {
        return new Promise((resolve, reject) => {
            resolve('assets/example-image.png');
        });
    }
}

export class BarcodeScannerMock extends BarcodeScanner {
    scan(options?): Promise<BarcodeScanResult> {
        return new Promise((resolve, reject) => {
            resolve({format: 'MSI', cancelled: true, text: 'w8efhwe'} as BarcodeScanResult);
        });
    }
}
