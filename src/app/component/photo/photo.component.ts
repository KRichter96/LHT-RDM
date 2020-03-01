import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, Platform, AlertController } from '@ionic/angular';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { PartDetailPage } from 'src/app/pages/part-detail/part-detail.page';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PartService } from 'src/app/services/part/part.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { ImageService } from 'src/app/services/image/image.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
})
export class PhotoComponent implements OnInit {

  images = [];
  imagePath = '';
  projectId: string;

  constructor(private alertCtrl: AlertController, private photoViewer: PhotoViewer, private imageService: ImageService,
              private projectService: ProjectService, private partDetail: PartDetailPage,
              private actionSheetController: ActionSheetController, private camera: Camera,
              private plt: Platform, private filePath: FilePath, private file: File,
              private toastService: ToastService, private webview: WebView, private storage: Storage,
              private ref: ChangeDetectorRef, private partService: PartService,
              private authService: AuthService) { }

  ngOnInit() {
    const partId = this.partDetail.getPartId();
    this.projectId = this.projectService.getProjectId();
    this.imagePath = 'image/' + this.projectId + '/' + partId;
    this.loadStoredImages();
  }

  openImage(url: string): void {
    this.photoViewer.show(url);
  }

  loadStoredImages() {
    this.storage.get(this.imagePath).then(images => {
      if (images) {
        const arr = JSON.parse(images);
        this.images = [];
        for (const img of arr) {
          const filePath = this.file.dataDirectory + img;
          const resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath });
        }
      }
    });
  }

  async selectImage() {
    if (!this.canWrite()) {
      this.toastService.displayToast('Not allowed to make any changes.');
      return;
    }

    this.partDetail.onSave(); // Speicher zwischen
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image source',
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 100,
      sourceType,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false, // Nicht in Bibliothek
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            const currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    });
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, () => {
      this.toastService.displayToast('Error while storing file.');
    });
  }

  updateStoredImages(name) {
    this.storage.get(this.imagePath).then(images => {
      const arr = JSON.parse(images);
      if (!arr) {
        const newImages = [name];
        this.storage.set(this.imagePath, JSON.stringify(newImages));
      } else {
        arr.push(name);
        this.storage.set(this.imagePath, JSON.stringify(arr));
      }

      const filePath = this.file.dataDirectory + name;
      const resPath = this.pathForImage(filePath);

      const newEntry = {
        name,
        path: resPath,
        filePath
      };

      this.images = [newEntry, ...this.images];
      // this.partService.updatePart(this.images, this.partId);
      this.imageService.uploadImage(newEntry, this.partDetail.getPartId());
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  async deleteImage(imgEntry, position) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Do you really want to delete this Image?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.images.splice(position, 1);

            this.storage.get(this.imagePath).then(images => {
              const arr = JSON.parse(images);
              const filtered = arr.filter(name => name !== imgEntry.name);
              this.storage.set(this.imagePath, JSON.stringify(filtered));

              const correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

              this.file.removeFile(correctPath, imgEntry.name).then(() => {
                this.toastService.displayToast('File removed.');
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      const converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  createFileName() {
    return new Date().getTime() + '.png';
  }

  canWrite(): boolean {
    return this.authService.canWrite();
  }
}
