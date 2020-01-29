import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {ConnectionStatus, NetworkService} from '../network/network.service';
import {catchError, map, tap} from 'rxjs/operators';
import {OfflineService} from '../offline/offline.service';
import {Storage} from '@ionic/storage';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  projectId: string;

  projectUrl: string;
  apiStorageKey = 'projects';

  constructor(private http: HttpClient, private networkService: NetworkService,
              private storage: Storage, private offlineManager: OfflineService,
              private backendUrlProviderService: BackendUrlProviderService) {
    this.projectUrl = this.backendUrlProviderService.getUrl() + 'projects';
  }

  public getProjects(): Observable<any>  {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.getLocalData('projects'));
    } else {
      return this.http.get(`${this.projectUrl}`).pipe(
        map(res => res['projects']),
        tap(res => {
          this.setLocalData('projects', res);
        })
      );
    }
  }
  // Evt löschen, da nichts geändert wird
  public updateProjects(projectid, data): Observable<any> {
    const url = `${this.projectUrl}/${projectid}`;

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } else {
      return this.http.put(url, data).pipe(catchError(err => {
          this.offlineManager.storeRequest(url, 'PUT', data);
          throw new Error(err);
        })
      );
    }
  }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${this.apiStorageKey}-${key}`, data);
  }

  // Get cached API result
  private getLocalData(key) {
    return this.storage.get(`${this.apiStorageKey}-${key}`);
  }

  public setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  public getProjectId(): string {
    return this.projectId;
  }
}
