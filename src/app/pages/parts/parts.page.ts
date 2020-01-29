import { AuthService } from './../../services/auth/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
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
import { ImageService } from 'src/app/services/image/image.service';
import { Storage } from '@ionic/storage';
import { TokenService } from 'src/app/services/token/token.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
  styles: [ '.greenClass { background-color: green } .yellowClass {background-color: red }']
})
export class PartsPage implements OnInit {

  @ViewChild('slidingList', null) slidingList: any;

  parts: PartModel[] = [];
  chips: Array<Chip> = [];
  searchTerm = '';
  id: string;
  progress = 0;
  offline = true;
  progressColor: string;

  constructor(private partService: PartService, private toastCtrl: ToastService,
              private alertCtrl: AlertController, private route: ActivatedRoute, private plt: Platform,
              private barcodeScanner: BarcodeScanner, private router: Router, private filterService: FilterService,
              private projectService: ProjectService, private networkService: NetworkService,
              private offlineManager: OfflineService, private popoverController: PopoverController,
              private token: TokenService, private authService: AuthService) {

      this.chips = new Array<Chip>();
      this.plt.ready().then(() => {
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            this.loadData();
          }
        });
        this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
          if (status === ConnectionStatus.Online) {
            this.offlineManager.checkForEvents().subscribe();
          }
        });
      });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
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

  doRefresh(event) {
    // console.log('Begin async operation');
    this.loadData();

    setTimeout(() => {
      // console.log('Async operation has ended');
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
      this.offline = this.checkOffline();
      if (this.chips.length > 0) {
        this.parts = this.partService.filterItems(this.chips);
      }
    });
  }

  checkOffline() {
    const status = this.networkService.getCurrentNetworkStatus();
    return status !== 0;
     // offline == true
  }

  onSync() {
    this.partService.updatePart('Parts', this.id).subscribe();
  }

  setSearchedItems() {
    // this.parts = this.partService.searchItems(this.searchTerm); //Suche nach einem Wertebereich in Category or Component
  }

  scanPartIdentTag() {
    // if (this.plt.is('android') || this.plt.is('ios') || this.plt.is('cordova')) {  // FIX HERE
      this.barcodeScanner.scan().then(barcodeData => {
        let partFound = false;
        if (barcodeData.cancelled) {
          return;
        }

        for (const part of this.parts) {
          if (part.counterId + '' === barcodeData.text) {
            partFound = true;
            this.router.navigate(['/part-detail/' + part.counterId]);
            break;
          }
        }
        if (!partFound) {
          this.toastCtrl.displayToast('No Part found');
        }
      });
    /*} else {
      this.toastCtrl.displayToast('Works only on a device!');
    }*/
  }

  deleteChip(i, event) {
    if (i > -1) { // Prüfe Index der chips
      this.chips.splice(i, 1); // Entferne ausgewählten Chip
    }
    event.target.value = -1;
    this.onChangeFilter(event); // Wende Filter an
  }

  async deletePart(i: number) {
    const alert = await this.alertCtrl.create({
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
            if (i > -1) {
              this.parts[i].remarksRemoval = 'true';
              this.parts[i].reasonRemoval = alertData.reason;
              this.parts[i].statusEdit = 'Deleted';
              const partToDelete = {...this.parts[i]};
              this.parts.splice(i, 1);
              this.partService.deletePart(partToDelete);
            } else {
              this.toastCtrl.displayToast('You can only delete parts created in the app.');
            }
            return true;
          } else {
            this.toastCtrl.displayToast('Please enter a reason for deletion!');
          }
        }
      }]
    });
    await alert.present();
    await this.slidingList.closeSlidingItems();
  }

  onChangeFilter(event) {
    if (event.target.value == null) { // Durch doppelten Aufruf, da event sicherstellen dass der Filter nur 1mal angewendet wird
      return;
    } else if (event.target.value === -1) {
      this.parts = this.partService.filterItems(this.chips);
      return;
    }

    if (!this.searchTerm) { // Wenn Suchfeld leer
      event.target.value = null;
      this.toastCtrl.displayToast('Please enter a filter value!');
    } else {
      const filterTerm = this.searchTerm;
      const filterObj = event.target.value;

      if (this.chips.length === 0) { // Wenn kein Filter gesetzt
        this.chips.push(new Chip(filterObj, filterTerm)); // Erstelle Chipsarray
        this.parts = this.partService.filterItems(this.chips); // Wende Filter an
      } else { // Wenn Filter bereits gesetzt
        const tempChips = this.chips.filter(x => x.FilterObj === filterObj);
        for (const chip of tempChips) {
          if (!(chip.FilterTerm.filter(x => x === filterTerm).length > 0)) {
            chip.FilterTerm = [...chip.FilterTerm, filterTerm];
            break;
          }
          for (const term of chip.FilterTerm) {
            if (term === filterTerm) {
              this.toastCtrl.displayToast('Already have this filter!');
              this.searchTerm = '';
              event.target.value = null;
              return;
            }
          }
        }
        if (tempChips.length === 0) {
          this.chips = [...this.chips, new Chip(filterObj, filterTerm)];
        }
        this.parts = this.partService.filterItems(this.chips);
      }
      event.target.value = null;
    }
    this.searchTerm = '';
  }

  updateProgressBar() {
    const cento = this.parts.length; // tslint:disable-next-line
    const percent = this.parts.filter(x => (x.rackNo !== '' && x.rackLocation !== '' && x.preModWeight !== '' && x.preModPNAC !== '' && x.nomenclature !== '' && x.rackNo !== 'N/A' && x.rackLocation !== 'N/A' && x.preModWeight !== 'N/A')).length; // percent of parts not completed
    const progress = percent / cento;
    if (progress !== 1) {
      this.progressColor = 'danger';
    } else {
      this.progressColor = 'success';
    }
    return progress;
  }

  public checkStatus(part) {
    try {
      const p: PartModel = part;
      return p.rackLocation && p.rackNo && p.preModWeight && p.preModWeight !== 'N/A' && p.rackLocation !== 'N/A' && p.rackNo !== 'N/A';
    } catch (Exception) {
      return false;
    }
  }

  async  filterStatus() {
    for (const chip of this.chips) {
      if (chip.FilterObj === 'Status') {
        this.toastCtrl.displayToast('Please remove the status filter!');
        break;
      }
    }

    const alert = await this.alertCtrl.create({
      header: 'Select the status you want to filter',
      inputs: [
        {
          type: 'radio',
          label: 'ToDo',
          value: '0'
        },
        {
          type: 'radio',
          label: 'Done',
          value: '1'
        }
    ],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => { }
      },
      {
        text: 'Ok',
        handler: data => {
          if (data === 0) {
            if (this.chips.length === 0) {
              this.chips.push(new Chip('Status', 'ToDo'));
            } else {
              this.chips = [...this.chips, new Chip('Status', 'ToDo')];
            }
            this.parts = this.partService.filterItems(this.chips);
          } else if (data === 1) {
            if (this.chips.length === 0) {
              this.chips.push(new Chip('Status', 'Done'));
            } else {
              this.chips = [...this.chips, new Chip('Status', 'Done')];
            }
            this.parts = this.partService.filterItems(this.chips);
          }
        }
      }]
    });
    await alert.present();
  }

  showStatus() {

  }

  async openPopover(ev: Event) {
    if (!this.canWrite()) {
      this.toastCtrl.displayToast('Not allowed to make any changes.');
      return;
    }

    const popover = await this.popoverController.create({
      component: PopoverPage,
      cssClass: 'child-pop-over-style',
      componentProps: {
        custom_id: this.id
      },
      event: ev
    });
    await popover.present();
  }

  deleteData() {
    this.token.setToken('');
    // this.offlineManager.checkForEvents().subscribe(() => { this.storage.clear() });
  }

  canWrite(): boolean {
    return this.authService.canWrite();
  }
}
