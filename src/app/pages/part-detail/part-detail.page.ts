import { AuthService } from '../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { PartModel } from 'src/app/models/part/partmodel';
import {ActivatedRoute, Router} from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { PartService } from 'src/app/services/part/part.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { generateUUID } from 'ionic/lib/utils/uuid';


@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {
  parts: PartModel[] = [];
  counterId: number;
  projectId: string;
  strProjectId: string;
  partItem: PartModel;
  selectedSegment: string;
  existingItem = true;
  isNewChildItem: boolean;
  disable: boolean;
  childItem: boolean; // used to filter html grids
  parentCounterId: number;
  parentWeight: string;
  childWeight: string;
  saved = false;
  newItem = true;

  newId: string; // todo needed?

  selectOptions = ['Attachment',
    'Bin',
    'Ceiling Panel',
    'Cockpit door',
    'Crew Rest',
    'Curtain',
    'Door Lining',
    'Emergency Equipment',
    'Lavatory',
    'Other',
    'Partition',
    'Passenger Seat',
    'PSU Filler Paner',
    'Seat',
    'Sidewall Panel',
    'Stairway',
    'Stowage',
    'Support Structure',
    'Galley',
    'New'];



  constructor(private alertCtrl: AlertController , private projectService: ProjectService, private toastCtrl: ToastService,
              private route: ActivatedRoute, private partService: PartService, private plt: Platform,
              private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.projectId = this.projectService.getProjectId();
    this.strProjectId = this.projectService.getProjectId().toString(); // needed for saves
    this.counterId = +this.route.snapshot.paramMap.get('id');

    if (this.partService.getPartById(this.counterId)){
      this.newItem = false;
    }

    this.selectedSegment = 'comment';
    if (this.newItem) { // If CounterId doesn't exist
      this.partItem = new PartModel();
      this.createNewPartItem(); // Completely New Item
      if (this.partService.parentCounterId > 1) {
        this.partItem = this.prepareForChildItem(this.partService.getPartById(this.partService.parentCounterId), this.partItem);
      }
    } else {
      this.plt.ready().then(() => {
        this.loadData();
      });
    }
  }

  createNewPartItem() {
    this.existingItem = false;
    this.partItem.projectId = this.strProjectId;
    this.partItem.id = generateUUID();
    this.partItem.statusCreate = 'New';
    this.partItem.statusEdit = '';
  }

  createChild() {
    const maxId = Math.max.apply(Math, this.partService.items.map(function (o) {return o.counterId;})) + 1; // tslint:disable-line
    this.partService.parentCounterId = this.counterId;
    this.router.navigate(['/part-detail/' + maxId]);
  }

  loadData() {
    this.partItem = this.partService.getPartById(this.counterId);
    this.parentWeight = this.partItem.preModWeight.replace(/,/i, '.');
    this.childItem = this.partItem.parentId !== '-1';
    if (this.partItem.parentId !== '-1') {
      this.partItem['parentCounterId'] = this.partService.items.filter(part => part.id === this.partItem.parentId)[0].counterId; // tslint:disable-line
    }
  }

  onSave() {
    if (!this.canWrite()) {
      this.toastCtrl.displayToast('Not allowed to make any changes.');
      return;
    }

    if ((this.newItem) && !this.saved) {
      if (this.childItem) {
        this.childWeight = this.partItem.preModWeight.replace(/,/i, '.');
        this.partItem.preModWeight.replace(/./i, ',');
        this.calculateWeight();
      } // set child weight back to ,
      this.partService.createPart(this.partItem);
      this.saved = true;
    } else {
      this.partService.updatePart(this.partItem, 'not needed');
    }
  }

  async otherPurpose(event, p) {
    if (!event.target.value) {
      return;
    }
    if (event.target.value === 'New') {
      const alert = await this.alertCtrl.create({
        header: 'New intended Purpose',
        message: 'Please describe your new Purpose',
        inputs: [{
          name: 'reason',
          placeholder: 'Intended Purpose',
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
            this.partItem.intendedPurpose = alertData.reason;
          }
        }]
      });
      await alert.present();
    }
  }

  async otherComponentType(event, p) {
    if (event.target.value == null) {
      return;
    }
    if (event.target.value === 'New') {
      const alert = await this.alertCtrl.create({
        header: 'New Component Type',
        message: 'Please describe your new ComponentType',
        inputs: [{
          name: 'reason',
          placeholder: 'Component Type',
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
            this.partItem.componentType = alertData.reason;
            console.log(this.partItem.componentType);
          }
        }]
      });
      await alert.present();
    }
  }

  prepareForChildItem(partItem: PartModel, child: PartModel): PartModel { // Keeps some properties for Child Item, deletes the rest
    this.childItem = true;
    this.isNewChildItem = true;
    child.category = partItem.category;
    child.componentType = partItem.componentType;
    child.postModPN = partItem.postModPN;
    child.arrangement = partItem.arrangement;
    child.ammRemovalTask = partItem.ammRemovalTask;
    child.ammInstallTask = partItem.ammInstallTask;
    child.reasonRemoval = partItem.reasonRemoval;
    child.intendedPurpose = partItem.intendedPurpose;
    child.installZoneRoom = partItem.installZoneRoom;
    child.preModPositionIPC = partItem.preModPositionIPC;
    child.parentId = partItem.id;
    child['parentCounterId'] = partItem.counterId; // tslint:disable-line
   // partItem.preModWeight = ""; // Writeable
    child.nomenclature = '';
    child.ipcReference = '';
    child.ipcItemNumber = '';
    child.preModPNAC = ''; // Writeable
    child.serialNo = ''; // Writeable
    child.rackNo = ''; // Writeable
    child.rackLocation = ''; // Writeable
    child.existingComponents = ''; // Writeable
    child.remarksRemoval = '';
    child.aupa = '';
    child.postModPosition = '';
    child.modDWG = '';
    child.panelPNAVI = '';
    child.integrCompPN = '';
    child.integrCompTypes = '';
    child.equipNo = '';
    child.integratedComponents = '';
    child.postModWeight = '';
    child.remarksMod = '';
    child.cmmReference = '';
    child.xxx = '';
    child.moC0 = '';
    child.moC1 = '';
    child.moC2 = '';
    child.testSample = '';
    child.moC4Flameability = '';
    child.moC7 = '';
    child.deleteReason = '';
    child.statusCreate = 'New';
    child.statusEdit = '';
    return child;
  }

  calculateWeight() {
    if (this.childItem) {
      const parentItem: PartModel = this.partService.getPartById(this.partService.parentCounterId);
      parentItem.preModWeight = parentItem.preModWeight.replace(',', '.');
      parentItem.preModWeight = parentItem.preModWeight.replace(' kg', '');

      const calculatedWorth = Math.round((+parentItem.preModWeight - +this.childWeight)).toString();
      parentItem.preModWeight = calculatedWorth.replace('.', ',');

      this.partService.updatePart(parentItem, parentItem.id);
    }
  }

  getPartId(): string {
    return this.partItem.id;
  }

  async segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }

  canWrite(): boolean {
    return this.authService.canWrite();
  }
}
