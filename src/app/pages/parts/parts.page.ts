import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartModel } from 'src/app/models/part/partmodel';
import { Platform, AlertController } from '@ionic/angular';
import { BarcodeService } from 'src/app/services/barcode/barcode.service';
import { PartService } from 'src/app/services/part/part.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Chip } from './Chip';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  parts: PartModel[] = [];
  chips: Array<Chip> = [];
  searchTerm: string = "";
  id: number;

  constructor(private partService: PartService, private barcodeService: BarcodeService, private toastCtrl: ToastService, 
    private alertCtrl: AlertController, private route: ActivatedRoute, private plt: Platform, private barcodeScanner: BarcodeScanner,
    private router: Router, private filterService: FilterService, private projectService: ProjectService) { 
      this.chips = new Array<Chip>();
  }
  
  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');
    this.projectService.setProjectId(this.id);

    if (this.filterService.getChips().length > 0) {
      this.chips = this.filterService.getChips();
      this.partService.filterItems(this.chips);
    }
    this.plt.ready().then(() => {
      this.loadData(true);
      this.setSearchedItems();
    })
  }
  
  openDetail() {
    this.filterService.setChips(this.chips);
  }

  loadData(refresh = false, refresher?) {
    this.partService.getParts(refresh, this.id)
    .subscribe(res => {
      this.parts = res;
      if (refresher) {
        refresher.target.complete();
      }
    });
  }

  onSync() {
    this.partService.updatePart('Parts', this.id).subscribe();
  }

  setSearchedItems() {
    //this.parts = this.partService.searchItems(this.searchTerm); //Suche nach einem Wertebereich in Category or Component
  }

  scanPartIdentTag() {
    //this.searchTerm = this.barcodeService.scanPartIdentTag();
    if (this.plt.is("android") || this.plt.is("ios") || this.plt.is("cordova")) {  // FIX HERE
      this.barcodeScanner.scan().then(barcodeData => {
        for (let part of this.parts) {
          if (part.postModPN === barcodeData.text) {
            this.router.navigate(['/part-detail/' + part.id]);
          }
          else {
            this.toastCtrl.displayToast("No Part found");
          }
        }
      })
    }
    else {
      this.toastCtrl.displayToast("Works only on a device!");
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
            this.parts[i].remarksRemoval = "true";
            this.parts[i].reasonRemoval = alertData.reason;
            return true;
          }
          else {
            this.toastCtrl.displayToast("Please enter a reason for deletion!");
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
      this.toastCtrl.displayToast("Please enter a filter value!");
    }
    else {
      var filterTerm = this.searchTerm;
      var filterObj = event.target.value;
      
      if (this.chips.length == 0) { //Wenn kein Filter gesetzt
        this.chips.push(new Chip(filterObj, filterTerm)); //Erstelle Chipsarray
        this.parts = this.partService.filterItems(this.chips); //Wende Filter an
      }
      else { //Wenn Filter bereits gesetzt
        let tempChips = this.chips.filter(x => x.FilterObj == filterObj);
        for (let chip of tempChips) {
          if (!(chip.FilterTerm.filter(x => x == filterTerm).length > 0)) {
            chip.FilterTerm = [...chip.FilterTerm, filterTerm];
            break;
          }       
          for (let term of chip.FilterTerm) {
            if (term == filterTerm) {
              this.toastCtrl.displayToast("Already have this filter!");
              this.searchTerm = "";
              event.target.value = null;
              return;
            }
          }
        }
        if (tempChips.length == 0) {
          this.chips = [...this.chips, new Chip(filterObj, filterTerm)];
        }
        this.parts = this.partService.filterItems(this.chips);
      }
      event.target.value = null;
    }
    this.searchTerm = "";
  }

  onAddItem() {
    console.log("this works");

  }
}
