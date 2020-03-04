import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {ConnectionStatus, NetworkService} from '../network/network.service';
import {map, tap} from 'rxjs/operators';
import {OfflineService} from '../offline/offline.service';
import {Storage} from '@ionic/storage';
import {Chip} from '../../pages/parts/Chip';
import {PartModel, setStatus} from 'src/app/models/part/partmodel';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  public items: PartModel[] = [];
  parentCounterId: number;

  constructor(private http: HttpClient, private networkService: NetworkService,
              private storage: Storage, private offlineManager: OfflineService,
              private bupService: BackendUrlProviderService) {}

  public getParts(projectId): Observable<any> {

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.getLocalData('parts' + projectId)).pipe(
        tap(res => {
          this.items = res;
        })
      );
    } else {
      return this.http.get(`${this.bupService.getUrl() + 'parts/byProject/' + projectId}`).pipe(
        map(res => res['parts']), // tslint:disable-line
        map(res => res.filter(part => part.statusEdit !== 'Deleted')),
        tap((res: PartModel[]) => {
          res.forEach(r => setStatus(r));
          this.setLocalData('parts' + projectId, res);
          this.items = res;
        })
      );
    }
  }

  public createPart(data: PartModel) {
    const partUrl = this.bupService.getUrl() + 'parts';
    setStatus(data);
    this.items.push(data);
    this.setLocalData('parts' + data.projectId, this.items);

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      this.offlineManager.storeRequest(partUrl, 'POST', data).then();
    } else {
      this.http.post(partUrl, data).subscribe(
        () => {},
        () => {
          this.offlineManager.storeRequest(partUrl, 'POST', data).then();
        }
      );
    }
  }

  getHighestCounterId(): number {
    let highestId = 1000;
    for (const part of this.items) {
      if (highestId < part.counterId) {
        highestId = part.counterId;
      }
    }
    return highestId + 1;
  }

  getPartById(counterId: number) {
    if (typeof counterId !== 'number') {
      counterId = parseInt(counterId, 10);
    }
    return this.items.find(x => x.counterId === counterId);
  }

  public updatePart(data: PartModel) {
    const partUrl = this.bupService.getUrl() + 'parts';
    setStatus(data);
    this.items[this.items.indexOf(this.getPartById(data.counterId))] = data;
    this.setLocalData('parts' + data.projectId, this.items);

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      this.offlineManager.storeRequest(partUrl, 'PUT', data).then();
    } else {
      this.http.put(partUrl, data).subscribe(
        () => {},
        () => {
          this.offlineManager.storeRequest(partUrl, 'PUT', data).then();
        }
      );
    }
  }


  public deletePart(data: PartModel)  {
    const partUrl = this.bupService.getUrl() + 'parts';
    this.items = this.items.filter(x => x.id !== data.id);
    this.setLocalData('parts' + data.projectId, this.items);

    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      this.offlineManager.storeRequest(partUrl, 'PUT', data).then();
    } else {
      this.http.put(partUrl, data).subscribe(
        () => {},
        () => {
          this.offlineManager.storeRequest(partUrl, 'PUT', data).then();
        }
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
          case 'ReasonForRemoval': {
            if (item.reasonRemoval.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'AUPA': {
            if (item.aupa.toString().toLowerCase().includes(term.toLowerCase())) {
              chipMatched = true;
            }
            break;
          }
          case 'RackLocation': {
            if (item.rackLocation.toString().toLowerCase().includes(term.toLowerCase())) {
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

  private setLocalData(key, data) {
    this.storage.set(`${key}`, data);
  }

  private getLocalData(key) {
    return this.storage.get(`${key}`);
  }
}
