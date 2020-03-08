import {Component, OnDestroy, OnInit} from '@angular/core';
import {Storage} from '@ionic/storage';
import {STORAGE_REQ_KEY, StoredRequest} from '../../services/offline/offline.service';
import {ToastService} from '../../services/toast/toast.service';
import {Entry, File} from '@ionic-native/file/ngx';
import {from, Observable, of, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError, mergeMap} from 'rxjs/operators';
import {
  removeImageRequestFromStorage,
  removePartRequestFromStorage,
  StorageHelperService
} from '../../services/storage-helper/storage-helper.service';
import {ObservableQService} from '../../services/observable-q/observable-q.service';
import {NavigationEnd, Router} from '@angular/router';

export class DevInfo {
  // for images
  locallySavedImageMeta = 0;
  locallySavedImageMetaImages = 0;
  locallySavedImages = 0;
  // for unsynchronized requests
  unsynchronizedParts = 0;
  unsynchronizedImages = 0;
  currentlyUploadedParts = 0;
  uploadingParts = false;
  currentlyUploadedImages = 0;
  uploadingImages = false;
  disableAll = false; // disables all buttons when doing something
}

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit, OnDestroy {

  devInfo = new DevInfo();
  routerSub: Subscription;

  // storage keys for the application
  private requestsKey = STORAGE_REQ_KEY;

  constructor(private storage: Storage,
              private toastService: ToastService,
              private file: File,
              private http: HttpClient,
              private storageHelperService: StorageHelperService,
              private obsQ: ObservableQService,
              private router: Router) {}

  ngOnInit() {
    this.initializeDevInfo();

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd &&
        event.urlAfterRedirects.includes('dev')) {
        this.initializeDevInfo();
      }
    });
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }

  initializeDevInfo() {
    this.devInfo.currentlyUploadedParts = 0;
    this.devInfo.currentlyUploadedImages = 0;

    // set information of unsynchronized requests
    this.setRequestInfo();

    // get stored image metadata
    this.setImageMetadataInfo().then();

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

        } catch (e) {

          this.devInfo.unsynchronizedParts = 0;
          this.devInfo.unsynchronizedImages = 0;
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
    if (!this.file.dataDirectory) {
      return;
    }

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

  // UPLOADS

  uploadAllParts(): void {
    this.devInfo.disableAll = true;
    this.devInfo.uploadingParts = true;
    this.storage.ready().then(() => {
      this.storage.get(this.requestsKey).then( result => {
        // extract part requests
        let partRequests: StoredRequest[];
        try {
          const requests: StoredRequest[]  = JSON.parse(result);
          partRequests = requests.filter(op => !(op.url.endsWith('/findings') || op.url.endsWith('/photos')));
        } catch (e) {
          this.toastService.displayToast('No valid request data found on device');
        }

        // upload requests recursively
        this.toastService.displayToast('Starting the uploading process.');
        this.uploadPart(partRequests, 0).subscribe(() => {
          // update devInfo 1s after response of last request succeeded
          // from here it seems every request succeeds, because the errors are
          // catched in uploadPart()
          setTimeout(() => {
            this.devInfo.disableAll = false;
            this.devInfo.uploadingParts = false;
            this.initializeDevInfo();
            this.toastService.displayToast('Finished the uploading process. If there are still unsyched requests left, please ' +
              'visit the details view.');
          }, 1500);
        });
      });
    });
  }

  uploadPart(operations: StoredRequest[], index: number): Observable<any> {
    const op = operations[index];
    return this.http.request('PUT', op.url, {body: op.data}).pipe(
      catchError(() => {
        // request failed
        // return a specific string
        return of('req has failed');
      }),
      mergeMap((data) => {
        if (data !== 'req has failed') {
          // remove request from storage and update devInfo
          const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.requestsKey,
            removePartRequestFromStorage, [op.data.id]);
          this.obsQ.addToQueue(storageRemove);
          this.devInfo.currentlyUploadedParts += 1;
        }

        // execute next request if there are any
        if (index + 1 < operations.length) {
          return this.uploadPart(operations, index + 1);
        }
        // last request succeeded, upload process is finished
        return of(null);
      })
    );
  }

  uploadAllImages(): void {
    this.devInfo.disableAll = true;
    this.devInfo.uploadingImages = true;
    this.storage.ready().then(() => {
      this.storage.get(this.requestsKey).then( result => {
        // extract images requests
        let imageRequests: StoredRequest[];
        try {
          const requests: StoredRequest[]  = JSON.parse(result);
          imageRequests = requests.filter(op => op.url.endsWith('/findings') || op.url.endsWith('/photos'));
        } catch (e) {
          this.toastService.displayToast('No valid request data found on device');
        }

        // upload requests recursively
        this.toastService.displayToast('Starting the uploading process.');
        this.uploadImage(imageRequests, 0).subscribe(() => {
          // update devInfo 1s after response of last request succeeded
          // from here it seems every request succeeds, because the errors are
          // catched in uploadImage()
          setTimeout(() => {
            this.devInfo.disableAll = false;
            this.devInfo.uploadingImages = false;
            this.initializeDevInfo();
            this.toastService.displayToast('Finished the uploading process. If there are still unsyched requests left, please ' +
              'visit the details view.');
          }, 1500);
        });
      });
    });
  }

  uploadImage(operations: StoredRequest[], index: number): Observable<any> {
    const op = operations[index];

    return from(this.file.readAsArrayBuffer(op.data.a, op.data.b)).pipe(
      mergeMap((res) => {
        // prepare request data
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', op.data.description);
        return this.http.post(op.url, formData).pipe(
          catchError(() => {
            // request failed
            // return a specific string
            return of('req has failed');
          }),
          mergeMap((data) => {
            if (data !== 'req has failed') {
              // remove request from storage and update devInfo
              const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.requestsKey,
                removeImageRequestFromStorage, [op.data.b]);
              this.obsQ.addToQueue(storageRemove);
              this.devInfo.currentlyUploadedImages += 1;
            }

            // execute next request if there are any
            if (index + 1 < operations.length) {
              return this.uploadImage(operations, index + 1);
            }
            // last request succeeded, upload process is finished
            return of(null);
          })
        );
      })
    );
  }

  // TEST HELPER

  createPartThatWillFail(): void {
    this.storage.ready().then(() => {
      this.storage.get(this.requestsKey).then( result => {
        // extract part requests
        let requests: StoredRequest[];
        try {
          requests = JSON.parse(result);
          requests.push({
            url: 'fjpwiefowjefi/parts',
            type: 'POST',
            data: {
              id: 'fwe98fwe98fwje8f',
              counterId: 123829743,
              projectId: 'mock.boid'
            },
            id: 'jfowefwoefjwefjo',
            time: 109283102
          });
          this.storage.set(this.requestsKey, JSON.stringify(requests)).then();
        } catch  (e) {
          // nothing
        }
      });
    });
  }
}
