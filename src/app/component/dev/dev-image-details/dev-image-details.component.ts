import {Component, OnInit} from '@angular/core';
import {STORAGE_REQ_KEY, StoredRequest} from '../../../services/offline/offline.service';
import {Storage} from '@ionic/storage';
import {HttpClient} from '@angular/common/http';
import {removeImageRequestFromStorage, StorageHelperService} from '../../../services/storage-helper/storage-helper.service';
import {ObservableQService} from '../../../services/observable-q/observable-q.service';
import {ToastService} from '../../../services/toast/toast.service';
import {AlertController} from '@ionic/angular';
import {Observable} from 'rxjs';
import {File} from '@ionic-native/file/ngx';

@Component({
  selector: 'app-dev-image-details',
  templateUrl: './dev-image-details.component.html',
  styleUrls: ['./dev-image-details.component.scss'],
})
export class DevImageDetailsComponent implements OnInit {

  imageRequests: StoredRequest[] = [];
  readonly requestsKey;

  constructor(private storage: Storage,
              private http: HttpClient,
              private storageHelperService: StorageHelperService,
              private obsQ: ObservableQService,
              private toastService: ToastService,
              private alertCtrl: AlertController,
              private file: File) {
    this.requestsKey = STORAGE_REQ_KEY;
  }

  ngOnInit() {
    this.initializeRequests();
  }

  initializeRequests(): void {
    // set requests
    this.storage.ready().then(() => {
      this.storage.get(this.requestsKey).then(result => {
        try {
          const requests: StoredRequest[] = JSON.parse(result);
          this.imageRequests = requests.filter(op => op.url.endsWith('/findings') || op.url.endsWith('/photos'));
        } catch (e) {
          // nothing
        }
      });
    });
  }

  uploadImage(index: number): void {
    const op = this.imageRequests[index];
    // read image file
    this.file.readAsArrayBuffer(op.data.a, op.data.b).then((res) => {
      // prepare request data
      const blob = new Blob([res], {type: 'image/png'});
      const formData = new FormData();
      formData.append('image', blob);
      formData.append('description', op.data.description);
      this.toastService.displayToast('Start upload.', 2000, 'bottom');
      this.http.post(op.url, formData).subscribe(() => {
        // remove request
        const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.requestsKey,
          removeImageRequestFromStorage, [op.data.b]);
        this.obsQ.addToQueue(storageRemove);

        // inform user of success
        this.toastService.displayToast('Uploaded image.', 2000, 'bottom');
        // refresh
        setTimeout(() => this.initializeRequests(), 1000);
      }, (error) => {
        // inform user of failure
        this.toastService.displayToast(error.message, 2000, 'bottom');
      });
    });
  }

  async deleteImageRequest(index: number) {
    const op = this.imageRequests[index];
    // prompt user if they want to remove the request
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Do you really want to this image?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // remove request
            const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.requestsKey,
              removeImageRequestFromStorage, [op.data.b]);
            this.obsQ.addToQueue(storageRemove);

            // TODO also delete image
            // TODO remove image from image meta
            // the finding description is saved via image index in image meta ->
            // therefore the image meta cannot be modified ->
            // the way the description is stored locally has to be reworked ->
            // this can only be done when there's no local data present (data might be lost otherwise)

            // after math
            setTimeout(() => {
              // refresh
              this.initializeRequests();
              // inform user of success
              this.toastService.displayToast('Image deleted.',
                2000, 'bottom');
            }, 1000);
          }
        }
      ]
    });
    await alert.present();
  }
}
