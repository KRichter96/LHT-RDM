import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {ConnectionStatus, NetworkService} from '../network/network.service';
import {map, tap} from 'rxjs/operators';
import {OfflineService} from '../offline/offline.service';
import {Storage} from '@ionic/storage';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  projectId: string;
  apiStorageKey = 'projects';

  constructor(private http: HttpClient, private networkService: NetworkService,
              private storage: Storage, private offlineManager: OfflineService,
              private bupService: BackendUrlProviderService) {}

  public getProjects(): Observable<any>  {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.getLocalData('projects'));
    } else {
      return this.http.get(`${this.bupService.getUrl() + 'projects'}`).pipe(
        map(res => res['projects']),
        tap(res => {
          this.setLocalData('projects', res);
        })
      );
    }
  }

  public getProjectsAfterLogin(): Observable<any>  {
    return this.http.get(`${this.bupService.getUrl() + 'projects'}`).pipe(
      map(res => res['projects']),
      tap(res => {
        this.setLocalData('projects', res);
      })
    );
  }

  private setLocalData(key, data) {
    this.storage.set(`${this.apiStorageKey}-${key}`, data);
  }

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
