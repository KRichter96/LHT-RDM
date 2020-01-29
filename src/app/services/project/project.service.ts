import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError } from 'rxjs/operators';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';
import { API_IP } from '../../../environments/environment';

const API_STORAGE_KEY = 'projects';
const PROJECT_URL = API_IP + 'projects';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  projectId: string;

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService) { }

  public getProjects(): Observable<any>  {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      return from(this.getLocalData('projects'));
    } else {
      return this.http.get(`${PROJECT_URL}`).pipe(
        map(res => res['projects']),
        tap(res => {
          this.setLocalData('projects', res);
        })
      );
    }
  }
  //Evt löschen, da nichts geändert wird
  public updateProjects(projectid, data): Observable<any> {
    let url = `${PROJECT_URL}/${projectid}`;

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
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }

  public setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  public getProjectId(): string {
    return this.projectId;
  }
}
