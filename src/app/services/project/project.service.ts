import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError } from 'rxjs/operators';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';

const API_STORAGE_KEY = 'projects';
<<<<<<< HEAD
const PROJECT_URL = 'http://192.168.40.125:8081/api/projects';
=======
//const PROJECT_URL = 'http://192.168.176.77:8081/api/projects';
const PROJECT_URL = 'http://192.168.2.55:8081/api/projects';
>>>>>>> e566163c2cb3ee63e14141473c99f750a5a14aec

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  projectId: number;

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService) { }

  public getProjects(): Observable<any>  {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      return from(this.getLocalData('projects'));
    } else {
      return this.http.get(`${PROJECT_URL}`).pipe(
        map(res => res['projects']),
        tap(res => {
          console.log('returns real live API data', PROJECT_URL);
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
    console.log("return local data");
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }

  public setProjectId(projectId: number) {
    this.projectId = projectId;
  }

  public getProjectId(): number {
    return this.projectId;
  }
}
