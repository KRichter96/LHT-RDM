import { Injectable } from '@angular/core';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { OfflineService } from '../offline/offline.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { File } from '@ionic-native/file/ngx';

const UPLOAD_IMAGE_URL = 'http://192.168.2.55:8081/api/parts/';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineService, private file: File) { }

  async uploadImage(data: any[], partId) {
    partId + 1;
    let url = `${UPLOAD_IMAGE_URL + partId + "/photos"}`;
    
    for (let image of data) {
      const formData = new FormData();
      formData.append('image', this.dataURItoBlob(image.filePath));
      formData.append('description', image.name);
      if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
        return from(this.offlineManager.storeRequest(url, 'POST', formData));
      } 
      else {
        this.http.post(url, formData).subscribe(
          response => {
          console.log(response);
          },
          error => {
            //alert(error);
            console.log(error);
          });
        return this.http.post(url, formData).pipe(catchError(err => {
          
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

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}
}
