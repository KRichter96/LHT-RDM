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
  partItem: PartModel;
  selectedSegment: string;
  existingItem: boolean;
  isNewItem: boolean;
  newId: any; //todo needed?

  constructor(private projectService: ProjectService, private toastCtrl: ToastService, private route: ActivatedRoute
              , private partService: PartService, private plt: Platform) {
  }

  ngOnInit() {
    this.counterId = +this.route.snapshot.paramMap.get('id');
    let newItem = this.route.snapshot.paramMap.get('new');
    this.isNewItem = newItem && newItem.indexOf('true') != -1;

    console.log("this.counterId: " + this.counterId);
    this.projectId = this.projectService.getProjectId();
    this.selectedSegment = "comment";

    if (this.counterId == -1) {
      this.partItem = new PartModel();
      this.createNewPartItem();
    } else {
      this.plt.ready().then(() => {
        this.loadData(true);
      });
    }
  }

  createNewPartItem() {
    this.existingItem = false;
    this.partItem.counterId = this.randomInt();
    console.log("id: " + this.counterId + ", current.counterId: " + this.partItem.counterId);
  }

  loadData(refresh = false) {
    let partItem: PartModel;
    this.partService.getParts(refresh, this.projectId).subscribe(e => {
      partItem = e[this.counterId];
      if(this.isNewItem) {
        this.partItem = this.prepareForChildItem(partItem);
      } else {
        this.partItem = partItem;
      }
      //this.partItem.statusEdit = "1";
    });
  }
  onSave() {
    console.log("counterId: " + this.counterId + ", current.counterId: " + this.partItem.counterId);
    if (this.partItem.counterId == this.counterId) {
      this.partService.updatePart(this.partItem, this.counterId);
    }
    else if (this.partItem.counterId > 9999){
      console.log(this.partItem.id);
      this.partItem.projectId = this.projectId.toString();
      this.partItem.id = generateUUID();
      this.partService.createPart(this.partItem);
    }
    else {
      this.partService.updatePart(this.partItem, this.counterId);
    }
  }
  randomInt(){
    return Math.floor(Math.random() * (2147483647 - 9999 + 1)) + 9999;
  }

  prepareForChildItem(partItem: PartModel): PartModel {
      partItem.id = "";
      partItem.projectId = "";
      //partItem.counterId;
      //partItem.nomenclature = "";
      //partItem.category = "";
      //partItem.componentType = "";
      //partItem.ipcReference = "";
      //partItem.ipcItemNumber = "";
      partItem.preModPNIPC = "";
      //partItem.preModPositionIPC = "";
      //partItem.location = "";
      //partItem.ammRemovalTask = "";
      //partItem.ammInstallTask = "";
      partItem.parentId = this.projectId.toString(); //todo is this right?
      //partItem.reasonRemoval = "";
      partItem.preModPNAC = ""; // Writeable
      //partItem.preModPositionAC = "";
      partItem.serialNo = ""; // Writeable
      partItem.existingComponents = ""; // Writeable
      partItem.preModWeight = ""; // Writeable
      partItem.rackNo = ""; // Writeable
      partItem.rackLocation = ""; // Writeable
      partItem.remarksRemoval = "";
      partItem.intendedPurpose = "";
      partItem.aupa = "";
      partItem.postModPN = "";
      partItem.postModPosition = "";
      partItem.modDWG = "";
      partItem.panelPNAVI = "N/A";
      partItem.integrCompPN = "N/A";
      partItem.integrCompTypes = "N/A";
      partItem.equipNo = "N/A";
      partItem.integratedComponents = "N/A";
      partItem.installZoneRoom = "TBD";
      partItem.postModWeight = "TBD";
      partItem.remarksMod = "N/A";
      partItem.cmmReference = "";
      partItem.xxx = "TBD";
      partItem.moC0 = "TBD";
      partItem.moC1 = "TBD";
      partItem.moC2 = "TBD";
      partItem.testSample = "TBD";
      partItem.moC4Flameability = "TBD";
      partItem.moC7 = "TBD";
      partItem.deleteReason = "";
      partItem.statusCreate = "New";
      //partItem.statusEdit = "";

    return partItem;
  }

  getPartId(): string {
    return this.partItem.id;
  }

  async segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }
}
