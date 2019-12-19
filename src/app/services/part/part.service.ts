import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, Subscriber } from 'rxjs';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { map, tap, catchError } from 'rxjs/operators';
import { OfflineService } from '../offline/offline.service';
import { Storage } from '@ionic/storage';
import { Chip } from '../../pages/parts/Chip';
import { PartModel } from 'src/app/models/part/partmodel';

const PART_URL = 'http://192.168.40.124:8081/api/parts/byProject/';
const UPDATE_PART_URL = 'http://192.168.40.124:8081/api/parts';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  public items: PartModel[] = [];

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService) { }

  public getParts(forceRefresh: boolean = false, projectId): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData('parts'));
    } else {
      return this.http.get(`${PART_URL + projectId}`).pipe(
        map(res => res['parts']),
        tap(res => {
          console.log('returns real live API data', PART_URL+projectId);
          this.setLocalData('parts', res);
          this.items = res;
        })
      );
    }
  }
 // array
  public setParts(forceRefresh: boolean = false, partId, partItem) {
        console.log('sets partdetail');
        this.setLocalData('parts', partItem);
  }

  getDimensionsByFind(id) {
    return this.items.find(x => x.counterId === id);
  }

  //TODO
  public updatePart(data, partId): Observable<any> {
    let url = `${UPDATE_PART_URL}`;

    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      this.items[this.getDimensionsByFind(data.counterId).counterId -1] = data;
      this.setLocalData('parts', this.items); //something went wrong here
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } 
    else {
      this.http.put(url, data).subscribe(
        response => {
        console.log(response);
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

  public filterItems(chips: Chip[]) :PartModel[] {
    return this.items.filter(item => this.filterObj(chips, item));
  }

  filterObj(chips: Chip[], item: PartModel): boolean {
    let ret = true;
    for (let chip of chips) {
      for (let term of chip.FilterTerm) {
        switch(chip.FilterObj) { 
          case "Ident-Nr": { 
            if (item.counterId.toString().toLowerCase().indexOf(term.toLowerCase()) > -1 == false) {
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
    this.storage.set(`${key}`, data);
  }

  //Get cached API result
  private getLocalData(key) {
    console.log("return local data");
    return this.storage.get(`${key}`);
  }
}
