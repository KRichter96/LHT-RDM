import { forkJoin, Observable, from, of } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, finalize, map, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage';

const STORAGE_REQ_KEY = "storedreq";

interface StoredRequest {
  url: string,
  type: string,
  data: any,
  time: number,
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {

  constructor(private storage: Storage, private toastController: ToastController, private http: HttpClient) { }

  checkForEvents(): Observable<any> {
    return from(this.storage.get(STORAGE_REQ_KEY)).pipe(
      switchMap(storedOperations => {
        let storedObj = JSON.parse(storedOperations);
        //console.log("online");
        if (storedObj && storedObj.length > 0) {
          return this.sendRequests(storedObj).pipe(
              finalize(() => {
                let toast = this.toastController.create({
                  message: "Local data successfully synced to API!",
                  duration: 3000,
                  position: "bottom"
                });
                toast.then(toast => toast.present());
                this.storage.remove(STORAGE_REQ_KEY);
              })
            );
        } else {
          //console.log("no local events");
          return of(false);
        }
      })
    );
  }

  storeRequest(url, type, data) {
    let toast = this.toastController.create({
      message: "Your data is stored locally because you seem to be offline",
      duration: 3000,
      position: "bottom"
    });
    toast.then(toast => toast.present());

    let action: StoredRequest = {
      url: url,
      type: type,
      data: data,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };

    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations);

      if (storedObj) {
        storedObj.push(action);
      } else {
        storedObj = [action];
      }

      // console.log("local request stored: ", action);
      // Save old & new local transactions back to Storage
      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }

  sendRequests(operations: StoredRequest[]) {
    let obs = [];

    for (let op of operations) {
      // console.log("Make one request: ", op);
      let oneObs = this.http.request(op.type, op.url, { body:op.data });
      obs.push(oneObs);
    }
    //Send out all local events and return once they are finished
    return forkJoin(obs);
  }
}
