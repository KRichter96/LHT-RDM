import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {ConnectionStatus, NetworkService} from '../network/network.service';
import {catchError, map, tap} from 'rxjs/operators';
import {OfflineService} from '../offline/offline.service';
import {Storage} from '@ionic/storage';
import {Chip} from '../../pages/parts/Chip';
import {PartModel} from 'src/app/models/part/partmodel';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  public items: PartModel[] = [];
  public projectid: string;

  partUrl: string;
  updatePartUrl: string;

  constructor(private http: HttpClient, private networkService: NetworkService,
              private storage: Storage, private offlineManager: OfflineService,
              private backendUrlProviderService: BackendUrlProviderService) {
    this.partUrl = this.backendUrlProviderService.getUrl() + 'parts/byProject/';
    this.updatePartUrl = this.backendUrlProviderService.getUrl() + 'parts';
  }

  public getParts(projectId): Observable<any> {
    this.projectid = projectId;
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.getLocalData('parts' + this.projectid));
    } else {
      return this.http.get(`${this.partUrl + projectId}`).pipe(
        map(res => res['parts']),
        map(res => res.filter(part => part.statusEdit !== 'Deleted')),
        tap(res => {
          this.setLocalData('parts' + projectId, res);
          this.items = res;
        })
      );
    }
  }

  public getOfflineParts() {
    if (1 === 1) {
      return this.getLocalData('parts' + this.projectid);
    }
  }

  public setParts(partId, partItem) {
    this.setLocalData('parts', partItem);
  }

  public createPart(data) {
    const url = `${this.updatePartUrl}`;
    this.items = [...this.items, data];
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      this.setLocalData('parts' + this.projectid, this.items); // something went wrong here
      return from(this.offlineManager.storeRequest(url, 'POST', data));
    } else {
      this.http.post(url, data).subscribe(response => {
          // console.log(response);
        },
        error => {
          alert(error);
          console.log(error);
      });
      return this.http.post(url, data).pipe(catchError(err => {
          this.offlineManager.storeRequest(url, 'POST', data);
          throw new Error(err);
        })
      );
    }
  }

  getDimensionsByFind(id) {
    return this.items.find(x => x.counterId === id);
  }

  // TODO
  public updatePart(data, partId): Observable<any> {
    const url = `${this.updatePartUrl}`;
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      this.items[this.getDimensionsByFind(data.counterId).counterId - 1] = data;
      this.setLocalData('parts' + this.projectid, this.items); // something went wrong here
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } else {
      this.http.put(url, data).subscribe(
        response => {
          // console.log(response);
        },
        error => {
          alert(error);
          console.log(error);
        });
      return this.http.put(url, data).pipe(catchError(err => {
          this.offlineManager.storeRequest(url, 'PUT', data);
          throw new Error(err);
        })
      );
    }
  }


  public deletePart(data): Observable<any>  {

    const url = this.updatePartUrl;
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      const filtered = this.items.filter(x => x.id !== data.id);

      this.items = filtered;
      this.setLocalData('parts' + this.projectid, this.items);
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } else {
      this.http.put(url, data).subscribe(
          response => {
            const filtered = this.items.filter(x => x.id !== data.id);
            this.items = filtered;
            this.setLocalData('parts' + this.projectid, this.items);
            // console.log(response);
          },
          error => {
            alert(error);
            console.log(error);
          });
      return this.http.put(url, data).pipe(catchError(err => {
          const filtered = this.items.filter(x => x.id !== data.id);
          this.items = filtered;
          this.setLocalData('parts' + this.projectid, this.items);
          this.offlineManager.storeRequest(url, 'DELETE', data);
          throw new Error(err);
          })
      );
    }

  }

  public filterItems(chips: Chip[]): PartModel[] {
    if (chips.length > 0) {
      return this.items.filter(item => this.filterObj(chips, item));
    }
    return this.items;
  }

  filterObj(chips: Chip[], item: PartModel): boolean {
    let ret = true;
    for (const chip of chips) {
      let chipMatched = false;
      for (const term of chip.FilterTerm) {
        switch (chip.FilterObj) {
          case 'Ident.-Nr.': {
            if (item.counterId.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'P/N': {
            if (item.postModPN.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'Nomenclature': {
            if (item.nomenclature.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'Category': {
            if (item.category.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'ComponentType': {
              if (item.componentType.toString().toLowerCase().includes(term.toLowerCase())) {
                chipMatched = true;
            }
              break;
          }
          case 'Status': {
            if (item.rackLocation && item.rackNo && item.preModWeight && item.preModWeight !== 'N/A' && item.rackLocation !== 'N/A' && item.rackNo !== 'N/A') { // tslint:disable-line
              if (term === 'Done') {
                chipMatched = true;
              }
            } else {
              if (term === 'ToDo') {
                chipMatched = true;
              }
            }
            break;
          }
          case 'Rack-Nr': {
            if (item.rackNo.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'Position': {
            if (item.preModPositionIPC.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'Arrangement': {
            if (item.arrangement.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'InstallationRoom': {
            if (item.installZoneRoom.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
        }
      }
      ret = ret && chipMatched;
    }
    return ret;
  }

  public searchItems(searchTerm) {
    return this.items.filter(item => {
      return item.category.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || item.componentType.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1; // tslint:disable-line
    });
  }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${key}`, data);
  }

  // Get cached API result
  private getLocalData(key) {
    return this.storage.get(`${key}`);
  }

  // delete
  private removeLocalData() {
    this.storage.remove('parts').then(() => {
      // console.log('part is removed');
    });
  }
}
