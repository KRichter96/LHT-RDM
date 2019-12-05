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
    if (chips.length == 3) {
      if (chips[0].FilterObj == chips[1].FilterObj && chips[0].FilterObj == chips[2].FilterObj) {
        console.log("alle gleich");
        //TODO
      }
      else if (chips[0].FilterObj == chips[1].FilterObj || chips[0].FilterObj == chips[2].FilterObj || chips[1].FilterObj == chips[2].FilterObj) {
        console.log("zwei gleich");
        //TODO
      }
      else {
        console.log("alle 3 versch.");
        //TODO
      }
    }
    else if (chips.length == 2)
    {
      if (chips[0].FilterObj == chips[1].FilterObj) {
        console.log("beide gleich");
        //TODO
      }
      else {
        console.log("alle 2 versch.");
        //TODO
      }
    }
    else if (chips.length == 1) {
      console.log("nur 1");
      return this.items.filter(item => this.filterObj(chips[0], item));
    }
    else {
      console.log("chipsanzahl 0");
      return this.items;
    }
  }

  filterObj(chip: Chip, item: PartModel) {
    
    for(let term of chip.FilterTerm) {
      switch(chip.FilterObj) { 
        case "Ident-Nr": { 
          return item.id.toLowerCase().indexOf(term.toLowerCase()) > -1; //FIX HERE
          
        } 
        case "P/N": { 
          return item.postModPN.toLowerCase().indexOf(term.toLowerCase()) > -1;
          
        } 
        case "Category": { 
          return item.category.toLowerCase().indexOf(term.toLowerCase()) > -1;
          
        } 
        case "componentType": { 
          return  item.componentType.toLowerCase().indexOf(term.toLowerCase()) > -1;
          
        } 
        case "Status": { 
          return  item.statusEdit.toLowerCase().indexOf(term.toLowerCase()) > -1;
          
        } 
        case "Rack-Nr": { 
          return  item.rackNo.toLowerCase().indexOf(term.toLowerCase()) > -1; 
          
        } 
        case "Position": { 
          return item.postModPosition.toLowerCase().indexOf(term.toLowerCase()) > -1;
          
        } 
        case "InstallationRoom": { 
          return item.installZoneRoom.toLowerCase().indexOf(term.toLowerCase()) > -1;
        } 
      }
    }
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
