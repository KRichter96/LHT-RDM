import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs';
import { PartModel } from 'src/app/models/part/partmodel';
import { Platform, AlertController, ToastController } from '@ionic/angular';
import { BarcodeService } from 'src/app/services/barcode/barcode.service';
import { PartService } from 'src/app/services/part/part.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { filter } from 'rxjs/operators';
import { Chip } from './Chip';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  parts: Observable<PartModel[]>;
  chips: Array<Chip>;
  searchTerm: string = "";
  id: any;

  constructor(private partService: PartService, private barcodeService: BarcodeService, private toastCtrl: ToastController, 
    private alertCtrl: AlertController, private route: ActivatedRoute, private plt: Platform, private barcodeScanner: BarcodeScanner,
    private router: Router) { 
      this.chips = new Array<Chip>();
  
  }
  
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.plt.ready().then(() => {
      this.loadData(true);
      this.setSearchedItems();
    })
  }
  
  loadData(refresh = false, refresher?) {
    this.partService.getParts(refresh, this.id).subscribe(res => {
      this.parts = res;
      console.log(this.parts);
      if (refresher) {
        refresher.target.complete();
      }
    });
  }
  
  onSync() {
    this.partService.updatePart('Parts', this.id).subscribe();
  }

  setSearchedItems() {
    this.parts = this.partService.searchItems(this.searchTerm); //Suche nach einem Wertebereich in Category or Component
  }

  scanPartIdentTag() {
    //this.searchTerm = this.barcodeService.scanPartIdentTag();
    if (this.plt.is("android") || this.plt.is("ios") || this.plt.is("cordova")) {  // FIX HERE
      this.barcodeScanner.scan().then(barcodeData => {
        this.router.navigate(['/part-detail/' + barcodeData.text]);
        //this.searchTerm = barcodeData.text;
      })
    }
    else {
      let toast = this.toastCtrl.create({
        message: "This will only work on a device!",
        duration: 3000,
        position: "bottom"
      });
      toast.then(toast => toast.present());
    }
  }

  deleteChip(i, event) {
    if(i > -1) { //Prüfe Index der chips
      this.chips.splice(i, 1); //Entferne ausgewählten Chip
    }
    event.target.value = -1;
    this.onChangeFilter(event); //Wende Filter an
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
        handler: () => { }
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

  onChangeFilter(event) {
    if (event.target.value == null) { //Durch doppelten Aufruf, da event sicherstellen dass der Filter nur 1mal angewendet wird
      return;
    }
    else if (event.target.value == -1) {
      this.parts = this.partService.filterItems(this.chips);
      return;
    }
    
    if (!this.searchTerm) { //Wenn Suchfeld leer
      event.target.value = null;
      let toast = this.toastCtrl.create({
        message: "Please insert something to filter!",
        duration: 3000,
        position: "bottom"
      });
      toast.then(toast => toast.present());
    }
    else {
      var filterTerm = this.searchTerm;
      var filterObj = event.target.value;
      if (this.chips.length == 0) { //Wenn kein Filter gesetzt
        // this.chips = [filterObj + ": " + filterTerm]; //Erstelle Chipsarray
        let chip = new Chip(filterObj, filterTerm);
        this.chips.push(chip) //Erstelle Chipsarray
        this.parts = null;
        this.parts = this.partService.filterItems(this.chips); //Wende Filter an
        console.log(this.parts);
      }
      else { //Wenn Filter bereits gesetzt
        if (this.chips.length >= 3) {
          let toast = this.toastCtrl.create({
            message: "max 3 filter!!!",
            duration: 3000,
            position: "bottom"
          });
          toast.then(toast => toast.present());
          return;
        }
        for (let i = 0; i < this.chips.length; i++) {
          if (this.chips[i].equals(this.chips[i], new Chip(filterObj, filterTerm))) {
            let toast = this.toastCtrl.create({
              message: "already have this filter!!!",
              duration: 3000,
              position: "bottom"
            });
            toast.then(toast => toast.present());
            
            this.searchTerm = "";
            event.target.value = null;
            return;
          }
        }

        // this.chips = [...this.chips, filterObj + ": " + filterTerm]; //Füge an Chipsarray, falls bereits Filter gesetzt
        this.chips.push(new Chip(filterObj, filterTerm)); //Füge an Chipsarray, falls bereits Filter gesetzt
        this.parts = null;
        console.log("huhu");
        
        this.parts = this.partService.filterItems(this.chips); //Wende Filter an
        console.log(this.parts);
      }
      event.target.value = null; //leere Filterfeld (Select), evt bessere Methode als ion-select?
    }
    this.searchTerm = ""; //leere Suchfeld
  }
}



