import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartModel } from 'src/app/models/part/partmodel';
import { Platform, AlertController, PopoverController } from '@ionic/angular';
import { BarcodeService } from 'src/app/services/barcode/barcode.service';
import { PartService } from 'src/app/services/part/part.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Chip } from './Chip';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { PopoverPage } from '../../component/popover/popover.page';
import { NetworkService, ConnectionStatus } from 'src/app/services/network/network.service';
import { OfflineService } from 'src/app/services/offline/offline.service';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
  styles: [ ".greenClass { background-color: green } .yellowClass {background-color: red }"]
})
export class PartsPage implements OnInit {

  @ViewChild('slidingList', null) slidingList: any;

  parts: PartModel[] = [];
  chips: Array<Chip> = [];
  searchTerm: string = "";
  id: number;
  progress: number = 0;
  offline: boolean = true;
  progressColor: string;


  constructor(private partService: PartService, private barcodeService: BarcodeService, private toastCtrl: ToastService,
    private alertCtrl: AlertController, private route: ActivatedRoute, private plt: Platform, private barcodeScanner: BarcodeScanner,
    private router: Router, private filterService: FilterService, private projectService: ProjectService,
    private networkService: NetworkService, private offlineManager: OfflineService, private popoverController: PopoverController) {
      this.chips = new Array<Chip>();
      this.plt.ready().then(() => {
        this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
          if (status == ConnectionStatus.Online) {
            this.offlineManager.checkForEvents().subscribe();
          }
        });
      });
  }
  
  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');
    this.projectService.setProjectId(this.id);

    if (this.filterService.getChips().length > 0) {
      this.chips = this.filterService.getChips();
      this.partService.filterItems(this.chips);
    }
    this.plt.ready().then(() => {
      this.loadData();
      this.setSearchedItems();
    });
  }

  updateProgressBar() {
    let cento = this.parts.length;
    let percent = this.parts.filter(x => ((x.rackNo != "N/A" && x.rackLocation != "N/A" && x.preModWeight != "N/A")
        || (x.rackNo != "" && x.rackLocation != "" && x.preModWeight != "" )) && (x.existingComponents !="" && x.preModPNAC !="" && x.serialNo !="")).length;
    let progress = percent / cento;
    if(progress != cento) {
      this.progressColor = "danger";
    } else {
      this.progressColor = "success";
    }
    return progress;
  }


  doRefresh(event) {
    console.log('Begin async operation');
    this.loadData();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }


  openDetail() {
    this.filterService.setChips(this.chips);
  }

  loadData() {
    this.partService.getParts(this.id).subscribe(res => {
      this.parts = res;
      this.updateProgressBar();
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
            this.router.navigate(['/part-detail/' + part.id + "/false"]);
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
            this.parts[i].statusEdit = "Deleted";
            if(this.parts[i].statusCreate == 'New' && this.offline == true) { //todo set real var
                if (i > -1) {
                    this.parts.splice(i, 1);
                    this.partService.deletePart(this.parts[i]);
                }
            }
            return true;
          }
          else {
            this.toastCtrl.displayToast("Please enter a reason for deletion!");
          }
        }
      }]
    });
    await alert.present();
    await this.slidingList.closeSlidingItems();
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

  checkStatus(part) {
    try {
      let p: PartModel = part;
      if (p.rackLocation && p.rackNo && p.preModWeight && p.preModWeight != "N/A" && p.rackLocation != "N/A" && p.rackNo != "N/A") {
        return true;
      }
      else {
        return false;
      }
    }
    catch (Exception) {
      return false;
    }
  }

  async openPopover(ev: Event) {
    const popover = await this.popoverController.create({
      component: PopoverPage,
      componentProps: {
      },
      event: ev
    });
    await popover.present();
  }
}
