import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {Storage} from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageHelperService {

  constructor(private storage: Storage) { }

  /**
   * Creates an observable that can be queued by the observable-q.
   * Reads a value, modifies it and writes it. Used with the observable-q it
   * is possible to access the storage synchroniously.
   *
   * @param key - which specifies the value to modify
   * @param func - which specifies how the value will be modified
   * @param args - the parameters of func
   */
  getAndSetFromStorage(key: string, func: Function, args: any[]): Observable<{}> { // tslint:disable-line
    return from(this.storage.ready()).pipe(
      mergeMap(() => {
        return from(this.storage.get(key)).pipe(
          map((res: string) => func(JSON.parse(res), ...args)),
          mergeMap(res => from(this.storage.set(key, JSON.stringify(res))))
        );
      })
    );
  }
}

/* example usage

   private append = (list: any[], t: number) => { list.push(t); return list; };

   const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    this.storage.set(this.key, JSON.stringify([])).then(() => {
      numbers.forEach(num => {
        // create observable
        const x: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.key, this.append, [num]);
        // add observable to queue
        this.promiseQService.addToQueue(x);
      });
    });

*/
