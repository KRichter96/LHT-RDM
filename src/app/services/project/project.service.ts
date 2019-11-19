import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError } from 'rxjs/operators';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';

const API_STORAGE_KEY = 'specialkey';
const PROJECT_URL = '../../../assets/projects.json';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService) { }

  public getProjects(forceRefresh: boolean = false): Observable<any>  {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData('projects'));
    } else {
      return this.http.get(`${PROJECT_URL}`).pipe(
        map(res => res['projects']),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData('projects', res);
        })
      );
    }
  }

  public updateProjects(projectid, data): Observable<any> {
    let url = `${PROJECT_URL}/projects/${projectid}`;

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
