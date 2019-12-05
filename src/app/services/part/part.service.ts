import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, Subscriber } from 'rxjs';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError, filter, count } from 'rxjs/operators';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';
import { Chip } from '../../pages/parts/Chip';
import { PartModel } from 'src/app/models/part/partmodel';

const API_STORAGE_KEY = 'specialkey';
const PART_URL = '../../../assets/data.json';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  public items: PartModel[] = [];

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

  //TODO
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

  public filterItems(chips: Chip[]) :PartModel[] {
    return this.items.filter(item => this.filterObj(chips, item));
  }

  filterObj(chips: Chip[], item: PartModel): boolean {
    let ret = true;
    for (let chip of chips) {
      for (let term of chip.FilterTerm) {
        switch(chip.FilterObj) { 
          case "Ident-Nr": { 
            if (item.id.toLowerCase().indexOf(term.toLowerCase()) > -1) {
              ret = false;
            }
            break;
          } 
          case "P/N": { 
            if(item.postModPN.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
              ret = false;
            }
            break;
          } 
          case "Category": { 
            if (item.componentType.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
              ret = false;
            }
            break;
          } 
          case "componentType": {
              if (item.componentType.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
                ret = false;
            }
            break;
          } 
          case "Status": { 
            if (item.statusEdit.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
              ret = false;
            }
            break;
          } 
          case "Rack-Nr": { 
            if (item.rackNo.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
              ret = false;
            }
            break;
          } 
          case "Position": { 
            if (item.postModPosition.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
              ret = false;
            }
            break;
            
          } 
          case "InstallationRoom": { 
            if (item.installZoneRoom.toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
              ret = false;
            }
            break;
          } 
        }
      }
      if (!ret) {
        return ret;
      }
    }
    return ret;
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
