import {forkJoin, from, Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Storage} from '@ionic/storage';
import {File} from '@ionic-native/file/ngx';
import {ToastService} from '../toast/toast.service';
import {mergeMap} from 'rxjs/operators';
import {Platform} from '@ionic/angular';
import {LogProvider} from '../logging/log.service';
import {
  appendRequestToStorage, removeRequestFromStorage,
  StorageHelperService
} from '../storage-helper/storage-helper.service';
import {ObservableQService} from '../observable-q/observable-q.service';
import {generateUUID} from 'ionic/lib/utils/uuid';

export const STORAGE_REQ_KEY = 'storedreq';
export const PARTS_UPLOAD_KEY = 'parts_upload_key';
export const IMAGES_UPLOAD_KEY = 'images_upload_key';

export interface StoredRequest {
  url: string;
  type: string;
  data: any;
  time: number;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {

  constructor(private storage: Storage,
              private toastService: ToastService,
              private http: HttpClient,
              private file: File,
              private plt: Platform,
              private log: LogProvider,
              private obsQ: ObservableQService,
              private storageHelperService: StorageHelperService) { }

  async checkForEvents() {

    const isP = await this.storage.get(PARTS_UPLOAD_KEY) || false;
    const isPartsUploadRunning = JSON.parse(isP || 'false'); // TODO does this work?
    const isI = await this.storage.get(IMAGES_UPLOAD_KEY) || false;
    const isImagesUploadRunning = JSON.parse(isI || 'false');

    if (isPartsUploadRunning && isImagesUploadRunning) {
      return;
    }

    this.storage.get(STORAGE_REQ_KEY).then(async storedOperations => {

      const storedObj = JSON.parse(storedOperations as string);
      if (storedObj && storedObj.length > 0) {
        const otherOperations = storedObj.filter(op => !(op.url.endsWith('/findings') || op.url.endsWith('/photos')));
        const imageOperations = storedObj.filter(op => op.url.endsWith('/findings') || op.url.endsWith('/photos'));

        // trigger images upload
        if (!isImagesUploadRunning && imageOperations.length > 0) {
          // set value to true (images are currently uploading)
          await this.storage.set(IMAGES_UPLOAD_KEY, JSON.stringify(true));
          // upload images
          this.sendImageRequestsSequentially(imageOperations, 0).subscribe(() => {
            this.log.log('Successfully uploaded offline images requests (' + imageOperations.length + ')');
            this.storage.set(IMAGES_UPLOAD_KEY, JSON.stringify(false));
          }, (error) => {
            this.log.err('Error on offline images uploads (' + imageOperations.length + '): ', error);
            this.storage.set(IMAGES_UPLOAD_KEY, JSON.stringify(false));
          });
        }

        // trigger parts upload
        if (!isPartsUploadRunning && otherOperations.length > 0) {
          // set value to true (parts are currently uploading)
          await this.storage.set(PARTS_UPLOAD_KEY, JSON.stringify(true));
          // upload parts
          this.sendPartRequestsSequentially(otherOperations, 0).subscribe(() => {
            this.log.log('Successfully uploaded offline parts requests (' + otherOperations.length + ')');
            this.storage.set(PARTS_UPLOAD_KEY, JSON.stringify(false));
          }, (error) => {
            this.log.err('Error on offline parts uploads (' + otherOperations.length + '): ', error);
            this.storage.set(PARTS_UPLOAD_KEY, JSON.stringify(false));
          });
        }
      }
    });
  }

  /**
   * Checks if there are unsynched part requests in the storage.
   *
   * @return true if there are unsynched requests and false if there are not
   */
  async hasUnsynchedPartRequests(): Promise<boolean> {
    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      try {
        const storedRequests: StoredRequest[] = JSON.parse(storedOperations as string);
        if (storedRequests) {
          const partRequests = storedRequests.filter(op => !(op.url.endsWith('/findings') || op.url.endsWith('/photos')));
          return partRequests.length > 0;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    });
  }

  /**
   * Checks if there are unsynched requests in the storage.
   *
   * @return true if there are unsynched requests and false if there are not
   */
  async hasUnsynchedRequests(): Promise<boolean> {
    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      try {
        const storedRequests: StoredRequest[] = JSON.parse(storedOperations as string);
        if (storedRequests) {
          return storedRequests.length > 0;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    });
  }

  storeRequest(url, type, data) {
    // when adding a request look through all stored requests and remove eveything that's put/post
    // for the part the current request is stored for
    this.toastService.displayToast('Your data is stored locally because you seem to be offline.');

    const action: StoredRequest = {
      url,
      type,
      data,
      time: new Date().getTime(),
      id: generateUUID()
    };

    // append request in storage
    const storageAppend: Observable<{}> = this.storageHelperService.getAndSetFromStorage(STORAGE_REQ_KEY,
      appendRequestToStorage, [action]);
    this.obsQ.addToQueue(storageAppend);

    return new Promise(() => {});
  }

  sendPartRequestsSequentially(operations: any[], index: number): Observable<any> {
    const op = operations[index];
    let type = '';

    if (op.type === 'POST' && op.url.endsWith('/parts')) {
      type = 'PUT';
    } else {
      type = op.type;
    }
    return this.http.request(type, op.url, {body: op.data}).pipe(
      mergeMap(() => {
        this.log.log('Offline upload of part (' + op.data.counterId + ')');

        // remove request from storage
        const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(STORAGE_REQ_KEY,
          removeRequestFromStorage, [op.id]);
        this.obsQ.addToQueue(storageRemove);

        if (index < operations.length - 1) {
          return this.sendPartRequestsSequentially(operations, index + 1);
        }

        return of(null);
      }),
    );
  }

  sendImageRequestsSequentially(operations: any[], index: number): Observable<any> {
    const op = operations[index];

    return from(this.file.readAsArrayBuffer(op.data.a, op.data.b)).pipe(
      mergeMap((res) => {

        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', op.data.description);
        return this.http.post(op.url, formData).pipe(
          mergeMap(() => {
            this.log.log('Offline upload of image (' + op.data.b + ')');

            // remove request from storage and update devInfo
            const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(STORAGE_REQ_KEY,
              removeRequestFromStorage, [op.id]);
            this.obsQ.addToQueue(storageRemove);

            if (index < operations.length - 1) {
              return this.sendImageRequestsSequentially(operations, index + 1);
            }

            return of(null);
          }),
        );
      })
    );
  }
}

