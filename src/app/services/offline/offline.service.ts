import {forkJoin} from 'rxjs';
import {ToastController} from '@ionic/angular';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Storage} from '@ionic/storage';
import {File} from '@ionic-native/file/ngx';

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

  constructor(private storage: Storage, private toastController: ToastController, private http: HttpClient,
              private file: File) { }

  checkForEvents() {
    this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {

      const storedObj = JSON.parse(storedOperations as string);
      if (storedObj && storedObj.length > 0) {
        this.sendRequests(storedObj).subscribe(() => {
          const toast = this.toastController.create({
            message: 'Local data successfully synced to API!',
            duration: 3000,
            position: 'bottom'
          });
          toast.then(t => t.present());
          this.storage.remove(STORAGE_REQ_KEY);
        });
      }
      }
    );
  }

  storeRequest(url, type, data) {
    // when adding a request look through all stored requests and remove eveything that's put/post
    // for the part the current request is stored for

    const toast = this.toastController.create({
      message: 'Your data is stored locally because you seem to be offline',
      duration: 3000,
      position: 'bottom'
    });
    toast.then(t => t.present());

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

    for (const op of otherOperations) {
      const oneObs = this.http.request(op.type, op.url, {body: op.data});
      obs.push(oneObs);
    }
    this.sendImageRequestsSequentially(imageOperations, 0);
    return forkJoin(obs);
  }

  sendImageRequestsSequentially(operations: any[], index: number) {
    const op = operations[index];

    this.file.readAsArrayBuffer(op.data.a, op.data.b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', op.data.description);
        this.http.post(op.url, formData).subscribe(() => {
          if (index < operations.length - 1) {
            this.sendImageRequestsSequentially(operations, index + 1);
          }
        });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
}
