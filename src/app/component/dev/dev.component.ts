import { Component, OnInit } from '@angular/core';
import {Storage} from '@ionic/storage';
import {STORAGE_REQ_KEY, StoredRequest} from '../../services/offline/offline.service';
import {ToastService} from '../../services/toast/toast.service';
import {Entry, File} from '@ionic-native/file/ngx';

export class DevInfo {
  locallySavedImageMeta = 0;
  locallySavedImageMetaImages = 0;
  locallySavedImages = 0;
  unsynchronizedParts = 0;
  unsynchronizedImages = 0;
}

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {

  devInfo = new DevInfo();

  // storage keys for the application
  private requestsKey = STORAGE_REQ_KEY;

  constructor(private storage: Storage,
              private toastService: ToastService,
              private file: File) {}

  ngOnInit() {
    this.initializeDevInfo();
  }

  initializeDevInfo() {
    // set information of unsynchronized requests
    this.setRequestInfo();

    // get stored image metadata
    this.setImageMetadataInfo();

    // get stored images on this device
    this.setImageInfo();

  }

  setRequestInfo(): void {
    this.storage.ready().then(() => {
      this.storage.get(this.requestsKey).then( result => {
        try {
          const requests: StoredRequest[]  = JSON.parse(result);
          const imageOperations = requests.filter(op => op.url.endsWith('/findings') || op.url.endsWith('/photos'));
          const otherOperations = requests.filter(op => !(op.url.endsWith('/findings') || op.url.endsWith('/photos')));

          this.devInfo.unsynchronizedParts = otherOperations.length;
          this.devInfo.unsynchronizedImages = imageOperations.length;

          // this.toastService.displayToast('Updated request information.', 2000, 'bottom');
        } catch (e) {

          this.devInfo.unsynchronizedParts = 0;
          this.devInfo.unsynchronizedImages = 0;

          /*if (result === null || result === undefined) {
            this.toastService.displayToast('No requests stored locally.', 2000, 'bottom');
          } else {
            this.toastService.displayToast('No valid requests stored locally.', 2000, 'bottom');
          }*/
        }
      });
    });
  }

  async setImageMetadataInfo() {
    this.storage.ready().then(() => {
      this.storage.keys().then(async (keys: string[]) => {
        // init values
        this.devInfo.locallySavedImageMeta = 0;
        this.devInfo.locallySavedImageMetaImages = 0;

        await keys.forEach(async (key: string) => {
          if (key.startsWith('finding/') || key.startsWith('image/')) {
            this.devInfo.locallySavedImageMeta += 1;
            await this.storage.get(key).then(async res => {
              try {
                const images: string[] = JSON.parse(res);
                this.devInfo.locallySavedImageMetaImages += images.length;
              } catch (e) {
                // nothing
              }
            });
          }
        });
      });
    });
  }

  setImageInfo(): void {
    const dataDir = this.file.dataDirectory.split('/');

    let path: string;
    let dirName: string;
    if (this.file.dataDirectory.endsWith('/')) {
      path = dataDir.slice(0, -2).join('/');
      dirName = dataDir[dataDir.length - 2];
    } else {
      path = dataDir.slice(0, -1).join('/');
      dirName = dataDir[dataDir.length - 1];
    }

    this.file.listDir(path, dirName).then((files: Entry[]) => {
      this.devInfo.locallySavedImages = 0;
      files.forEach((file: Entry) => {
        if (file.name.endsWith('.png') || file.name.endsWith('.jpeg') || file.name.endsWith('.jpg')) {
          this.devInfo.locallySavedImages += 1;
        }
      });
    });
  }

}
