import {Component, OnInit} from '@angular/core';
import {STORAGE_REQ_KEY, StoredRequest} from '../../../services/offline/offline.service';
import {Storage} from '@ionic/storage';
import {ProjectModel} from '../../../models/project/ProjectModel';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {
  removeRequestFromStorage,
  StorageHelperService
} from '../../../services/storage-helper/storage-helper.service';
import {ObservableQService} from '../../../services/observable-q/observable-q.service';
import {ToastService} from '../../../services/toast/toast.service';
import {AlertController} from '@ionic/angular';
import {LogProvider} from '../../../services/logging/log.service';

@Component({
  selector: 'app-dev-part-details',
  templateUrl: './dev-part-details.component.html',
  styleUrls: ['./dev-part-details.component.scss'],
})
export class DevPartDetailsComponent implements OnInit {

  partRequests: StoredRequest[] = [];
  projectMap = {};
  readonly requestsKey;

  constructor(private storage: Storage,
              private http: HttpClient,
              private storageHelperService: StorageHelperService,
              private obsQ: ObservableQService,
              private toastService: ToastService,
              private alertCtrl: AlertController,
              private log: LogProvider) {
    this.requestsKey = STORAGE_REQ_KEY;
  }

  ngOnInit() {
    this.initializeRequests();
  }

  initializeRequests(): void {
    // set requests
    this.storage.ready().then(() => {
      this.storage.get(this.requestsKey).then(result => {
        try {
          const requests: StoredRequest[] = JSON.parse(result);
          this.partRequests = requests.filter(op => !(op.url.endsWith('/findings') || op.url.endsWith('/photos')));
        } catch (e) {
          // nothing
        }
      });
    }).then(() => {
      // set project names
      this.storage.ready().then(() => {
        this.storage.get('projects-projects').then(res => {

          let projects: ProjectModel[];
          if (res !== null && res !== undefined) {
            projects = res; // projects are not saved using JSON.stringify()
          } else {
            projects = [];
          }

          projects.forEach(project => {
            this.projectMap[project.id] = project.title;
          });
        });
      });
    });
  }

  uploadPart(index: number): void {
    const op = this.partRequests[index];
    this.http.request('PUT', op.url, {body: op.data}).subscribe(() => {
      // remove request from storage
      const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.requestsKey,
        removeRequestFromStorage, [op.id]);
      this.obsQ.addToQueue(storageRemove);

      // inform user of success
      this.toastService.displayToast('Uploaded part ' + op.data.counterId + ' (' + this.projectMap[op.data.projectId] + ')',
        2000, 'bottom');
      this.log.log('Successful upload of dev part-details (' + op.data.counterId + ')');
      // refresh
      setTimeout(() => this.initializeRequests(), 1000);
    }, (error) => {
      // inform user of failure
      this.log.err('Error on dev part-details upload (' + op.data.counterId + ') ', error);
      this.toastService.displayToast(error.message, 2000, 'bottom');
    });
  }

  async deletePartRequest(index: number) {
    const op = this.partRequests[index];
    // prompt user if they want to remove the request
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Do you really want to delete part ' + op.data.counterId + ' of project ' + this.projectMap[op.data.projectId] + '?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // remove request
            const storageRemove: Observable<{}> = this.storageHelperService.getAndSetFromStorage(this.requestsKey,
              removeRequestFromStorage, [op.id]);
            this.obsQ.addToQueue(storageRemove);

            // after math
            setTimeout(() => {
              // refresh
              this.initializeRequests();
              // inform user of success
              this.log.log('Deleted dev part-details (' + op.data.counterId + ')');
              this.toastService.displayToast('Deleted part ' + op.data.counterId + ' (' + this.projectMap[op.data.projectId] + ')',
                2000, 'bottom');
            }, 1000);
          }
        }
      ]
    });
    await alert.present();
  }
}
