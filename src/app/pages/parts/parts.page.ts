import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { from, Observable } from 'rxjs';
import { PartModel } from 'src/app/models/part/partmodel';
import { PartDetailPage } from '../part-detail/part-detail.page';
import { Platform, AlertController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { BarcodeService } from 'src/app/services/barcode/barcode.service';
import { PartService } from 'src/app/services/part/part.service';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  parts: Observable<PartModel[]>;
  searchTerm: string = "";
  id: any;

  constructor(private partService: PartService,private barcodeService: BarcodeService, private toastCtrl: ToastController, private alertCtrl: AlertController,private route: ActivatedRoute, private plt: Platform, private barcodeScanner: BarcodeScanner) { 

  }
  
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.plt.ready().then(() => {
      this.loadData(true);
      this.setSearchedItems();
    })
  }

  setSearchedItems() {
    this.parts = this.partService.searchItems(this.searchTerm);
  }

  loadData(refresh = false, refresher?) {
    this.partService.getParts(refresh, this.id).subscribe(res => {
      this.parts = res;
      if (refresher) {
        refresher.target.complete();
      }
    });
  }

  scanPartIdentTag() {
    this.searchTerm = this.barcodeService.scanPartIdentTag();
  }

  async deletePart(i: number) {
    let alert = await this.alertCtrl.create({
      header: 'Reason for removal',
      message: 'Please describe your reason for removing this part',
      inputs: [{
        name: 'reason',
        placeholder: 'Reason for deletion',
        type: 'text'
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {

        }
      },
      {
        text: 'Ok',
        handler: (alertData) => {
          if (alertData.reason) {  
            this.parts[i].remarksRemoval = true;
            this.parts[i].reasonRemoval = alertData.reason;
            return true;
          }
          else {
            let toast = this.toastCtrl.create({
              message: "Please enter a reason!",
              duration: 3000,
              position: "bottom"
            });
            toast.then(toast => toast.present());
            return false;
          }
        }
      }]
    });
    await alert.present();
   }

  onClean() {
    
  }

  onAddItem() {
    //this.router.navigate();
  }
  
  onSync() {
    this.partService.updatePart('Parts').subscribe();
  }

}
