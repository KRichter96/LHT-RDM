import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError } from 'rxjs/operators';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';

const API_STORAGE_KEY = 'specialkey';
const PART_URL = '../../../assets/data.json';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  public items: any = [];

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService) { }

  public getParts(forceRefresh: boolean = false, partId): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData('parts'));
    } else {
      return this.http.get(`${PART_URL}` /*append partId*/).pipe(
        map(res => res['parts']),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData('parts', res);
          this.items = res;
        })
      );
    }
  }

  //GO ON HERE
  public updatePart(data, partId): Observable<any> {
    let url = `${PART_URL}`; ///parts/${partId}
    console.log(url);

    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } 
    else {
      return this.http.put(url, data).pipe(catchError(err => {
          this.offlineManager.storeRequest(url, 'PUT', data);
          throw new Error(err);
        })
      );
    }
  }

  public filterItems(filterTerm) {
    
  }

  public searchItems(searchTerm) {
    return this.items.filter(item => {
      return item.category.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || item.componentType.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  //Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  //Get cached API result
  private getLocalData(key) {
    console.log("return local data");
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }
}
