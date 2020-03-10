import {Injectable} from '@angular/core';
import {ConnectionStatus, NetworkService} from '../network/network.service';
import {OfflineService} from '../offline/offline.service';
import {HttpClient} from '@angular/common/http';
import {from} from 'rxjs';
import {File} from '@ionic-native/file/ngx';
import {BackendUrlProviderService} from '../backend-url-provider/backend-url-provider.service';
import {LogProvider} from '../logging/log.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  images: any[] = [];

  constructor(private http: HttpClient,
              private networkService: NetworkService,
              private offlineManager: OfflineService,
              private file: File,
              private bupService: BackendUrlProviderService,
              private log: LogProvider) {}

  async uploadImage(image: any, partId) {
    const url = `${this.bupService.getUrl() + 'parts/' + partId + '/photos'}`;

    // do not upload directly if there are still unsynchronized requests
    // if the parts this image belongs to is unsynchronized the backend will throw
    // an error. if the image is directly uploaded while other images are uploaded
    // the upload speed drops
    const hasUnsynchedRequests = await this.offlineManager.hasUnsynchedRequests();

    const a = image.filePath.substring(0, image.filePath.lastIndexOf('/'));
    const b = image.filePath.substring(image.filePath.lastIndexOf('/') + 1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', '');
        const data = {a, b, description: ''};

        if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline || hasUnsynchedRequests) {
          return from(this.offlineManager.storeRequest(url, 'POST', data));
        } else {
          this.http.post(url, formData).subscribe(
            () => {
              this.log.log('Directly upload photo (' + b + ') of part (' + partId + ')');
            },
            (error) => {
              this.log.err('Error on upload of photo (' + b + ') of part (' + partId + ') ', error);
              this.offlineManager.storeRequest(url, 'POST', data);
            });
        }
      } catch (e) {

      }
    });
  }

  async uploadFinding(data: any, partId) {
    const url = `${this.bupService.getUrl() + 'parts/' + partId + '/findings'}`;

    // do not upload directly if there are still unsynchronized requests
    // if the parts this image belongs to is unsynchronized the backend will throw
    // an error. if the image is directly uploaded while other images are uploaded
    // the upload speed drops
    const hasUnsynchedRequests = await this.offlineManager.hasUnsynchedRequests();

    const a = data.filePath.substring(0, data.filePath.lastIndexOf('/'));
    const b = data.filePath.substring(data.filePath.lastIndexOf('/') + 1);
    this.file.readAsArrayBuffer(a, b).then((res) => {
      try {
        const blob = new Blob([res], {type: 'image/png'});
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('description', data.description);
        const d = {a, b, description: data.description};

        if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline || hasUnsynchedRequests) {
          return from(this.offlineManager.storeRequest(url, 'POST', d));
        } else {
          this.http.post<any>(url, formData).subscribe(
            response => {
              this.images.push(response.projectId, data);
              this.log.log('Directly upload finding (' + b + ') of part (' + partId + ')');
            },
            (error) => {
              this.log.err('Error on upload of finding (' + b + ') of part (' + partId + ') ', error);
              this.offlineManager.storeRequest(url, 'POST', d);
            });
        }
      } catch (e) {

      }
    });
  }
}
