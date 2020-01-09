import { Injectable } from '@angular/core';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { OfflineService } from '../offline/offline.service';
import { HttpClient } from '@angular/common/http';
import { from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';

const UPLOAD_IMAGE_URL = 'http://192.168.40.125:8081/api/parts/';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient, private networkService: NetworkService, private offlineManager: OfflineService, private file: File, private storage: Storage) { }

  uploadImage(image: any, partId, imagepath) {
    let url = `${UPLOAD_IMAGE_URL + partId + "/photos"}`;
    let a = image.filePath.substring(0, image.filePath.lastIndexOf('/'));
    let b = image.filePath.substring(image.filePath.lastIndexOf('/')+1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        let blob = new Blob([res], {type: "image/png"});
        var formData = new FormData();
        formData.append('image', blob);
        formData.append('description', image.name);
        if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
          return from(this.offlineManager.storeRequest(url, 'POST', formData));
        } 
        else {
          this.http.post(url, formData).subscribe(
            response => {
              this.storage.remove(imagepath);
              console.log(response);
            },
            error => {
              this.offlineManager.storeRequest(url, 'POST', formData);
              console.log(error);
            });
        }
      } catch (e) {

      }
    })
  }

  uploadFinding(data: any[], partId) {
    let url = `${UPLOAD_IMAGE_URL + partId + "/findings"}`;

    for (let image of data) {
      let a = image.filePath.substring(0, image.filePath.lastIndexOf('/'));
      let b = image.filePath.substring(image.filePath.lastIndexOf('/')+1);
      this.file.readAsArrayBuffer(a, b).then((res) => {
        try {
          let blob = new Blob([res], {type: "image/png"});
          var formData = new FormData();
          formData.append('image', blob);
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
                this.offlineManager.storeRequest(url, 'POST', formData);
                console.log(error);
              });
          }
        } catch (e) {

        }
      })
    }
  }
}