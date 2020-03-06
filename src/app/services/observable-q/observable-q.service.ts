import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * A queue for observables. Added observables are only triggered after
 * the previous observable is done. Used to synch the asynch operations
 * of the ionic storage.
 */
@Injectable({
  providedIn: 'root'
})
export class ObservableQService {

  private observable$ = new Subject<Observable<{}>>();
  private queue: Observable<{}>[] = [];

  /**
   * Subscribe to the subject to trigger the execution of the first observable in the list.
   */
  constructor() {
    this.observable$.subscribe(obs => {
      this.execute(obs);
    });
  }

  /**
   * Subscribes to the observable and thus triggers it's execution.
   * After the execution finishes, the observable is removed from the
   * queue and the next one if present is triggered.
   *
   * @param observable - to execute
   */
  private execute(observable: Observable<{}>) {
    observable.subscribe(() => {
      this.queue.shift();
      this.startNextRequest();
    });
  }

  /**
   * Trigger execution of next observable if there is one.
   */
  private startNextRequest() {
    // get next request, if any.
    if (this.queue.length > 0) {
      this.execute(this.queue[0]);
    }
  }

  /**
   * Adds an observable to the queue and triggers it's execution if it's the only one in the queue.
   *
   * @param observable - that is added to the queue
   */
  public addToQueue(observable: Observable<{}>): void {
    this.queue.push(observable);

    if (this.queue.length === 1) {
      this.observable$.next(observable);
    }
  }
}
