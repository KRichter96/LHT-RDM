import {forkJoin, from, Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Storage} from '@ionic/storage';
import {File} from '@ionic-native/file/ngx';
import {ToastService} from '../toast/toast.service';
import {mergeMap} from 'rxjs/operators';
import {Platform} from '@ionic/angular';

const STORAGE_REQ_KEY = 'storedreq';

interface StoredRequest {
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
              private plt: Platform) { }

  async checkForEvents() {

    this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {

      const storedObj = JSON.parse(storedOperations as string);
      if (storedObj && storedObj.length > 0) {

        this.sendRequests(storedObj).subscribe(async () => {
          this.toastService.displayToast('Local data successfully synced to API!', 3000);

          await this.plt.ready().then();
          await this.storage.ready().then();
          this.storage.remove(STORAGE_REQ_KEY).then();
        });
      }
      }
    );
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
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };

    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations) as StoredRequest[];

      if (storedObj) {
        // for post/put requests of parts
        // look through all actions and remove prior post/put requests of the same part
        if (action.url.endsWith('/parts') && (action.type === 'POST' || action.type === 'PUT')) {
          storedObj = storedObj.filter(obj => !(obj.url.endsWith('/parts') && obj.data.id === action.data.id));
        }

        storedObj.push(action);
      } else {
        storedObj = [action];
      }

      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }

  sendRequests(operations: StoredRequest[]) {
    const obs = [];

    const imageOperations = operations.filter(op => op.url.endsWith('/findings') || op.url.endsWith('/photos'));
    const otherOperations = operations.filter(op => !(op.url.endsWith('/findings') || op.url.endsWith('/photos')));

    // add part requests
    for (const op of otherOperations) {
      let oneObs; // do not make POST requests for creating parts in offline service
      if (op.type === 'POST' && op.url.endsWith('/parts')) {
        oneObs = this.http.request('PUT', op.url, {body: op.data});
      } else {
        oneObs = this.http.request(op.type, op.url, {body: op.data});
      }
      obs.push(oneObs);
    }

    // add image requests
    if (imageOperations.length > 0) {
      obs.push(this.sendImageRequestsSequentially(imageOperations, 0));
    }

    return forkJoin(obs);
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
            if (index < operations.length - 1) {
              return this.sendImageRequestsSequentially(operations, index + 1);
            }

            return of(null);
          })
        );
      })
    );
  }
}

