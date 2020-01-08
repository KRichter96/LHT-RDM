import { Component, OnInit } from '@angular/core';
import { PartModel } from 'src/app/models/part/partmodel';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
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
  counterId: number;
  projectId: number;
  strProjectId: string;
  partItem: PartModel;
  selectedSegment: string;
  existingItem: boolean;
  isNewItem: boolean;
  disable: boolean;
  childItem: boolean;
  newId: any; //todo needed?

  constructor(private projectService: ProjectService, private toastCtrl: ToastService, private route: ActivatedRoute
              , private partService: PartService, private plt: Platform) {
  }

  ngOnInit() {

    this.projectId = this.projectService.getProjectId();
    this.strProjectId = this.projectService.getProjectId().toString(); //needed for saves
    this.counterId = +this.route.snapshot.paramMap.get('id');
    let newItem = this.route.snapshot.paramMap.get('new');
    this.isNewItem = newItem && newItem.indexOf('true') != -1;
    console.log("newitem: "+ this.isNewItem);
    this.selectedSegment = "comment";

    this.childItem = false;

    if (this.counterId == -1) {
      this.partItem = new PartModel();
      this.createNewPartItem();
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
    this.partItem.counterId = this.randomInt();
    this.partItem.statusCreate = "New";
    this.partItem.statusEdit = "Edited";
    this.counterId = this.partItem.counterId;
  }

  loadData() {
    let partItem: PartModel;
    this.partService.getParts(this.projectId).subscribe(e => {
      partItem = e.filter(x => {return x.counterId == this.counterId})[0]; // Get only the partItem with same CounterId
      if(this.isNewItem) {
        this.partItem = this.prepareForChildItem(partItem);
        this.partItem.parentId = this.partItem.id; // Set the copied Id as ParentId
        this.partItem.counterId = this.randomInt(); // Create temp CounterId, will be replaced in parts.service
        this.partItem.id = generateUUID();
        this.childItem = true;
      } else {
        this.partItem = partItem;
        if (this.partItem.parentId == "-1") {
          this.childItem = false;
        }
        else {
            this.childItem = true;
        }
      }
    });
  }
  onSave() {
    if (this.partItem.counterId > 99999){
      console.log(this.partItem);
      this.partService.createPart(this.partItem);
    }
    else {
      this.partService.updatePart(this.partItem, this.partItem.counterId);
    }
  }
  randomInt(){
    return Math.floor(Math.random() * (2147483647 - 99999 + 1)) + 99999;
  }

  prepareForChildItem(partItem: PartModel): PartModel { // Keeps some properties for Child Item, deletes the rest
      /* taken from Parent PartItem
         partItem.nomenclature = "";
         partItem.category = "";
         partItem.componentType = "";
         partItem.postModPN = "";
         partItem.location = "";
         partItem.ammRemovalTask = "";
         partItem.ammInstallTask = "";
         partItem.reasonRemoval = "";
         partItem.intendedPurpose = "";
         partItem.installZoneRoom = "";
      */
      partItem.preModPositionIPC = "";
      partItem.ipcReference = "";
      partItem.ipcItemNumber = "";
      partItem.preModPNAC = ""; // Writeable
      partItem.serialNo = ""; // Writeable
      partItem.preModWeight = ""; // Writeable
      partItem.rackNo = ""; // Writeable
      partItem.rackLocation = ""; // Writeable
      partItem.existingComponents = ""; // Writeable
      partItem.remarksRemoval = "";
      partItem.aupa = "";
      partItem.postModPosition = "";
      partItem.modDWG = "";
      partItem.panelPNAVI = "";
      partItem.integrCompPN = "";
      partItem.integrCompTypes = "";
      partItem.equipNo = "";
      partItem.integratedComponents = "";
      partItem.postModWeight = "";
      partItem.remarksMod = "";
      partItem.cmmReference = "";
      partItem.xxx = "";
      partItem.moC0 = "";
      partItem.moC1 = "";
      partItem.moC2 = "";
      partItem.testSample = "";
      partItem.moC4Flameability = "";
      partItem.moC7 = "";
      partItem.deleteReason = "";
      partItem.statusCreate = "New";
      partItem.statusEdit = "Edited";
      console.log("partItem: "+ partItem);
    return partItem;
  }

  getPartId(): string {
    return this.partItem.id;
  }

  async segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }
}
