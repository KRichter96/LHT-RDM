import { Injectable } from '@angular/core';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { OfflineService } from '../offline/offline.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { File } from '@ionic-native/file/ngx';

const UPLOAD_IMAGE_URL = 'http://192.168.40.124:8081/api/parts/';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService, private file: File) { }

  uploadImage(data: any[], partId) {
    partId + 1;
    let url = `${UPLOAD_IMAGE_URL + partId + "/photos"}`;
    
    for (let image of data) {
      console.log("yo", url, image.filePath);
      this.file.getFile(image.filePath, image.name, null);
      if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
        return from(this.offlineManager.storeRequest(url, 'POST', image.filePath));
      } 
      else {
        this.http.post(url, image.filePath).subscribe(
          response => {
          console.log(response);
          },
          error => {
            //alert(error);
            console.log(error);
          });
        return this.http.post(url, image.filePath).pipe(catchError(err => {
          
          this.offlineManager.storeRequest(url, 'POST', image.filePath);
          throw new Error(err);
        }));
      }
    }
  }

  uploadFinding(data: any[], partId) {
    let url = `${UPLOAD_IMAGE_URL + partId + "/findings"}`;

    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'POST', data));
    } 
    else {
      for (let image of data) {
        this.http.post(url, image[2]).subscribe(
          response => {
          console.log(response);
          },
          error => {
            //alert(error);
            console.log(error);
          });
        return this.http.put(url, data).pipe(catchError(err => {
          this.offlineManager.storeRequest(url, 'POST', image[2]);
          throw new Error(err);
        }));
      }
    }
  }
}
