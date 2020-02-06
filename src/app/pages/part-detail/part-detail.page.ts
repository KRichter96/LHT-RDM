import { AuthService } from './../../services/auth/auth.service';
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
  existingItem: boolean;
  isNewChildItem: boolean;
  disable: boolean;
  childItem: boolean; // used to filter html grids
  parentCounterId: number;
  parentWeight: string;
  childWeight: string;
  saved = false;

  newId: string; // todo needed?

  selectOptions = ["Attachment",
    "Bin",
    "Ceiling Panel",
    "Cockpit door",
    "Crew Rest",
    "Curtain",
    "Door Lining",
    "Emergency Equipment",
    "Lavatory",
    "Other",
    "Partition",
    "Passenger Seat",
    "PSU Filler Paner",
    "Seat",
    "Sidewall Panel",
    "Stairway",
    "Stowage",
    "Support Structure",
    "Galley",
    "New"]



  constructor(private alertCtrl: AlertController , private projectService: ProjectService, private toastCtrl: ToastService, private route: ActivatedRoute,
              private partService: PartService, private plt: Platform, private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.projectId = this.projectService.getProjectId();
    this.strProjectId = this.projectService.getProjectId().toString(); // needed for saves
    this.counterId = +this.route.snapshot.paramMap.get('id');

    let newItem = true;
    if (this.partService.getPartById(this.counterId)){
      newItem = false;
    }

    this.selectedSegment = 'comment';
    if (newItem) { // If CounterId doesn't exist
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
    if (this.partItem.parentId === '-1') {
      this.childItem = false;
    } else {
      this.childItem = true;
    }
  }

  onSave() {
    if (!this.canWrite()) {
      this.toastCtrl.displayToast('Not allowed to make any changes.');
      return;
    }

    if ((this.isNewChildItem) && !this.saved) {
      if (this.partItem.preModWeight) {
        this.childWeight = this.partItem.preModWeight.replace(/,/i, '.');
        this.partItem.preModWeight.replace(/./i, ',');
      } // set child weight back to ,
      this.partService.createPart(this.partItem);
      this.calculateWeight();
      this.saved = true;
    } else {
      this.partService.updatePart(this.partItem, "not needed");
    }
  }

  async otherPurpose(event, p) {
    if (!event.target.value)
      return;
    if (event.target.value === "New") {
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
    if (event.target.value == null)
      return;
    if (event.target.value === "New") {
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
    child.parentId = partItem.id;
   // partItem.preModWeight = ""; // Writeable
    child.nomenclature = "";
    child.ipcReference = "";
    child.ipcItemNumber = "";
    child.preModPNAC = ""; // Writeable
    child.serialNo = ""; // Writeable
    child.rackNo = ""; // Writeable
    child.rackLocation = ""; // Writeable
    child.existingComponents = ""; // Writeable
    child.remarksRemoval = "";
    child.aupa = "";
    child.postModPosition = "";
    child.modDWG = "";
    child.panelPNAVI = "";
    child.integrCompPN = "";
    child.integrCompTypes = "";
    child.equipNo = "";
    child.integratedComponents = "";
    child.postModWeight = "";
    child.remarksMod = "";
    child.cmmReference = "";
    child.xxx = "";
    child.moC0 = "";
    child.moC1 = "";
    child.moC2 = "";
    child.testSample = "";
    child.moC4Flameability = "";
    child.moC7 = "";
    child.deleteReason = "";
    child.statusCreate = "New";
    child.statusEdit = "";
    return child;
  }

  calculateWeight() {
    if(this.childItem == true) {
      var parentItem: PartModel = this.partService.getPartById(this.partService.parentCounterId);
      parentItem.preModWeight = parentItem.preModWeight.replace(",", ".");
      parentItem.preModWeight = parentItem.preModWeight.replace(" kg", "");
      console.log("old ", +parentItem.preModWeight);
      var calculatedWorth = Math.round((+parentItem.preModWeight - +this.childWeight)).toString(); //parentItem.preModWeight
      parentItem.preModWeight = calculatedWorth.replace(".",","); // set parent weight back to ,
      parentItem.preModWeight = parentItem.preModWeight + " kg";
      console.log("new " + parentItem.preModWeight);
      this.partService.updatePart(parentItem, parentItem.id);
      console.log(parentItem);
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
