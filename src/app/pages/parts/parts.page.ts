import {AuthService} from '../../services/auth/auth.service';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {PartModel} from 'src/app/models/part/partmodel';
import {AlertController, IonItemSliding, Platform, PopoverController} from '@ionic/angular';
import {PartService} from 'src/app/services/part/part.service';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';
import {Chip} from './Chip';
import {ToastService} from 'src/app/services/toast/toast.service';
import {FilterService} from 'src/app/services/filter/filter.service';
import {ProjectService} from 'src/app/services/project/project.service';
import {PopoverPage} from '../../component/popover/popover.page';
import {NetworkService} from 'src/app/services/network/network.service';
import {OfflineService} from 'src/app/services/offline/offline.service';
import {TokenService} from 'src/app/services/token/token.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
  styles: [ '.greenClass { background-color: green } .yellowClass {background-color: red }']
})
export class PartsPage implements OnInit, OnDestroy {

  @ViewChild('slidingItem', {static: false}) slidingItem: IonItemSliding;
  parts: PartModel[] = [];
  chips: Array<Chip> = [];
  searchTerm = '';
  progress = 0;
  offline = true;
  progressColor: string;
  routerSub: Subscription;

  constructor(private partService: PartService, private toastService: ToastService,
              private alertCtrl: AlertController, private route: ActivatedRoute, private plt: Platform,
              private barcodeScanner: BarcodeScanner, private router: Router, private filterService: FilterService,
              private projectService: ProjectService, private networkService: NetworkService,
              private offlineManager: OfflineService, private popoverController: PopoverController,
              private token: TokenService, private authService: AuthService) {

    this.chips = new Array<Chip>();
  }

  ngOnInit() {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd &&
        event.urlAfterRedirects.includes('parts/' + this.projectService.getProjectId())) {
        setTimeout(() => this.loadData(), 250);
      }
    });

    if (this.filterService.getChips().length > 0) {
      this.chips = this.filterService.getChips();
      this.partService.filterItems(this.chips);
    }
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  doRefresh(event) {
    this.loadData();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  openDetail() {
    this.filterService.setChips(this.chips);
  }

  loadData() {
    this.partService.getParts(this.projectService.getProjectId()).subscribe(res => {
      if (this.chips.length > 0) {
        this.parts = [...this.partService.filterItems(this.chips)];
      } else {
        this.parts = [...res];
      }
      this.offline = this.checkOffline();
    });
  }

  checkOffline() {
    const status = this.networkService.getCurrentNetworkStatus();
    return status !== 0;
  }

  scanPartIdentTag() {
    this.barcodeScanner.scan().then(barcodeData => {
      let partFound = false;
      if (barcodeData.cancelled) {
        return;
      }

      for (const part of this.parts) {
        if (part.counterId + '' === barcodeData.text) {
          partFound = true;
          this.router.navigate(['/part-detail/' + part.counterId]).then();
          break;
        }
      }
      if (!partFound) {
        this.toastService.displayToast('No Part found');
      }
    });
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
              this.parts = [...this.parts];
              this.partService.deletePart(partToDelete as PartModel);
              this.slidingItem.close().then();
            } else {
              this.toastService.displayToast('You can only delete parts created in the app.');
            }
            return true;
          } else {
            this.toastService.displayToast('Please enter a reason for deletion!');
          }
        }
      }]
    });
    await alert.present();
  }

  onChangeFilter(event) {
    if (event.target.value == null) { // Durch doppelten Aufruf, da event sicherstellen dass der Filter nur 1mal angewendet wird
      return;
    } else if (event.target.value === -1) {
      this.parts = [...this.partService.filterItems(this.chips)];
      return;
    }

    if (!this.searchTerm) { // Wenn Suchfeld leer
      event.target.value = null;
      this.toastService.displayToast('Please enter a filter value!');
    } else {
      const filterTerm = this.searchTerm;
      const filterObj = event.target.value;

      if (this.chips.length === 0) { // Wenn kein Filter gesetzt
        this.chips.push(new Chip(filterObj, filterTerm)); // Erstelle Chipsarray
        this.parts = [...this.partService.filterItems(this.chips)]; // Wende Filter an
      } else { // Wenn Filter bereits gesetzt
        const tempChips = this.chips.filter(x => x.FilterObj === filterObj);
        for (const chip of tempChips) {
          if (!(chip.FilterTerm.filter(x => x === filterTerm).length > 0)) {
            chip.FilterTerm = [...chip.FilterTerm, filterTerm];
            break;
          }
          for (const term of chip.FilterTerm) {
            if (term === filterTerm) {
              this.toastService.displayToast('Already have this filter!');
              this.searchTerm = '';
              event.target.value = null;
              return;
            }
          }
        }
        if (tempChips.length === 0) {
          this.chips = [...this.chips, new Chip(filterObj, filterTerm)];
        }
        this.parts = [...this.partService.filterItems(this.chips)];
      }
      event.target.value = null;
    }
    this.searchTerm = '';
  }

  async filterStatus() {
    for (const chip of this.chips) {
      if (chip.FilterObj === 'Status') {
        this.toastService.displayToast('Please remove the status filter!');
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
          if (data === '0') {
            if (this.chips.length === 0) {
              this.chips.push(new Chip('Status', 'ToDo'));
            } else {
              this.chips = [...this.chips, new Chip('Status', 'ToDo')];
            }
            this.parts = [...this.partService.filterItems(this.chips)];
          } else if (data === '1') {
            if (this.chips.length === 0) {
              this.chips.push(new Chip('Status', 'Done'));
            } else {
              this.chips = [...this.chips, new Chip('Status', 'Done')];
            }
            this.parts = [...this.partService.filterItems(this.chips)];
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
      this.toastService.displayToast('Not allowed to make any changes.');
      return;
    }

    const popover = await this.popoverController.create({
      component: PopoverPage,
      cssClass: 'child-pop-over-style',
      event: ev
    });
    await popover.present();
  }

  canWrite(): boolean {
    return this.authService.canWrite();
  }
}
