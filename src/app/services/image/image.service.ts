import {Injectable} from '@angular/core';
import {ConnectionStatus, NetworkService} from '../network/network.service';
import {OfflineService} from '../offline/offline.service';
import {HttpClient} from '@angular/common/http';
import {from} from 'rxjs';
import {File} from '@ionic-native/file/ngx';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: any[] = [];
  imageUrl: string;

  constructor(private http: HttpClient, private networkService: NetworkService,
              private offlineManager: OfflineService, private file: File,
              private backendUrlProviderService: BackendUrlProviderService) {
    this.imageUrl = this.backendUrlProviderService.getUrl() + 'parts/';
  }

  uploadImage(image: any, partId) {
    const url = `${this.imageUrl + partId + '/photos'}`;

    const a = image.filePath.substring(0, image.filePath.lastIndexOf('/'));
    const b = image.filePath.substring(image.filePath.lastIndexOf('/') + 1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', '');
        const data = {a, b, description: ''};
        if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
          return from(this.offlineManager.storeRequest(url, 'POST', data));
        } else {
          this.http.post(url, formData).subscribe(() => {},
            () => {
              this.offlineManager.storeRequest(url, 'POST', data);
            });
        }
      } catch (e) {

      }
    });
  }

  uploadFinding(data: any, partId) {
    const url = `${this.imageUrl + partId + '/findings'}`;

    const a = data.filePath.substring(0, data.filePath.lastIndexOf('/'));
    const b = data.filePath.substring(data.filePath.lastIndexOf('/') + 1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', data.description);
        const d = {a, b, description: data.description};
        if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
          return from(this.offlineManager.storeRequest(url, 'POST', d));
        } else {
          this.http.post<any>(url, formData).subscribe(
            response => {
              this.images.push(response.projectId, data);
            },
            error => {
              this.offlineManager.storeRequest(url, 'POST', d);
            });
        }
      } catch (e) {

      }
    });
  }
}
