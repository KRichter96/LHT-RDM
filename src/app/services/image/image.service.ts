import { Injectable } from '@angular/core';
import { NetworkService, ConnectionStatus } from '../network/network.service';
import { OfflineService } from '../offline/offline.service';
import { HttpClient } from '@angular/common/http';
import { from } from 'rxjs';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { API_IP } from './../../../environments/environment';

const UPLOAD_IMAGE_URL = API_IP + 'parts/';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: any[] = [];

  constructor(private http: HttpClient, private networkService: NetworkService,
              private offlineManager: OfflineService, private file: File) { }

  uploadImage(image: any, partId) {
    const url = `${UPLOAD_IMAGE_URL + partId + '/photos'}`;

    const a = image.filePath.substring(0, image.filePath.lastIndexOf('/'));
    const b = image.filePath.substring(image.filePath.lastIndexOf('/') + 1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', '');
        if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
          return from(this.offlineManager.storeRequest(url, 'POST', formData));
        } else {
          this.http.post(url, formData).subscribe(
            response => {
              // nothing
            },
            error => {
              this.offlineManager.storeRequest(url, 'POST', formData);
              console.log(error);
            });
        }
      } catch (e) {

      }
    });
  }

  /*
  // this does not work currently since the image id is not saved
  updateFinding(data: any, partId: string, description: string) {
    console.log(data);
    console.log(description);
    const url = `${UPLOAD_IMAGE_URL + partId + '/photos/' + data.id}`;
    const formData = new FormData();
    formData.append('description', description);


    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'PATCH', formData));
    } else {
      this.http.patch<any>(url, formData).subscribe(
        response => {
          console.log(response.id, response.description);
        },
        error => {
          this.offlineManager.storeRequest(url, 'PATCH', formData);
          console.log(error);
        });
    }
  }*/

  uploadFinding(data: any, partId) {
    const url = `${UPLOAD_IMAGE_URL + partId + '/findings'}`;

    const a = data.filePath.substring(0, data.filePath.lastIndexOf('/'));
    const b = data.filePath.substring(data.filePath.lastIndexOf('/') + 1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', data.description);
        if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
          return from(this.offlineManager.storeRequest(url, 'POST', formData));
        } else {
          this.http.post<any>(url, formData).subscribe(
            response => {
              this.images.push(response.id, data);
              // console.log(response.id, ' asdasdasd');
            },
            error => {
              this.offlineManager.storeRequest(url, 'POST', formData);
              console.log(error);
            });
        }
      } catch (e) {

      }
    });
  }
}
