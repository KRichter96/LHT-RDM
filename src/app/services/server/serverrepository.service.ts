import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError } from 'rxjs/operators';
import { PartModel } from 'src/app/models/part/partmodel';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';

const API_STORAGE_KEY = 'specialkey';
const PART_URL = '../../../assets/data.json';
const PROJECT_URL = '../../../assets/projects.json';

@Injectable({
  providedIn: 'root'
})
export class ServerRepositoryService {

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService) { }

  public getData() {
    
    return this.http.get('../../../assets/data.json').toPromise().then(
      response => {
				if (response != false) {
					return response;
        } 
        else {
					return null;
				}
			},
			error => {
				return null;
			});
  }

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

  public getParts(forceRefresh: boolean = false, partId): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData('parts'));
    } else {
      return this.http.get(`${PART_URL}` /*append partId*/).pipe(
        map(res => res['parts']),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData('parts', res);
        })
      );
    }
  }

  updateParts(partId, data): Observable<any> {
    let url = `${PART_URL}/parts/${partId}`;
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

  updateProjects(projectid, data): Observable<any> {
    let url = `${PROJECT_URL}/projects/${projectid}`;
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
  

   //Save result of API requests
   private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  //Get cached API result
  private getLocalData(key) {
    console.log("return local data");
    return this.storage.set(`${API_STORAGE_KEY}-${key}`, null);
  }
}
