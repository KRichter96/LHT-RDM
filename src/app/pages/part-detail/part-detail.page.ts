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
  parts: PartModel[] = [];
  counterId: number;
  projectId: number;
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

  newId: any; //todo needed?



  constructor(private projectService: ProjectService, private toastCtrl: ToastService, private route: ActivatedRoute
              , private partService: PartService, private plt: Platform) {
  }

  ngOnInit() {
    this.projectId = this.projectService.getProjectId();
    this.strProjectId = this.projectService.getProjectId().toString(); //needed for saves
    this.counterId = +this.route.snapshot.paramMap.get('id');
    let newItem = this.route.snapshot.paramMap.get('new');
    this.isNewChildItem = newItem && newItem.indexOf('true') != -1; //bool
    this.selectedSegment = "comment";

    this.childItem = false;

    if (this.counterId == -1) { // If CounterId doesn't exist
      this.partItem = new PartModel();
      this.createNewPartItem(); // Completely New Item
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
    let parentItem: PartModel;
    this.partService.getParts(this.projectId).subscribe(e => {
      this.parts = e;
      partItem = e.filter(x => {return x.counterId == this.counterId})[0]; // Get only the partItem with same CounterId

      if(this.isNewChildItem) { // Only goes in when completely new  child item
        this.partItem = this.prepareForChildItem(partItem);
        this.parentCounterId = this.counterId; // sets ParentId in html
        this.parentWeight = this.partItem.preModWeight.replace(/,/i,".");
        this.partItem.preModWeight = "";
        this.partItem.parentId = this.partItem.id; // Set the copied Id as ParentId
        this.partItem.counterId = this.randomInt(); // Create temp CounterId, will be replaced in parts.service ((IF ONLINE))
        this.partItem.id = generateUUID();
        this.childItem = true;
      } else {
        this.partItem = partItem;
        if (this.partItem.parentId == "-1") { // if new Item
          this.childItem = false;
        }
        else { // is Existing Child Item
          this.childItem = true; // sets child grid
          parentItem = e.filter(x => {return x.id == this.partItem.parentId})[0];
          this.parentCounterId = parentItem.counterId; // sets ParentId in html
        }
      }
    });
  }
  onSave() {
    if (this.partItem.counterId > 99999){
      this.childWeight = this.partItem.preModWeight.replace(/,/i,".");
      this.partItem.preModWeight.replace(/./i,","); // set child weight back to ,
      this.partService.createPart(this.partItem);
      console.log("calc");
      //this.calculateWeight();
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
       partItem.category = "";
       partItem.componentType = "";
       partItem.postModPN = "";
       partItem.arrangement = "";
       partItem.ammRemovalTask = "";
       partItem.ammInstallTask = "";
       partItem.reasonRemoval = "";
       partItem.intendedPurpose = "";
       partItem.installZoneRoom = "";
    */
    partItem.nomenclature = "";
    partItem.preModPositionIPC = "";
    partItem.ipcReference = "";
    partItem.ipcItemNumber = "";
    partItem.preModPNAC = ""; // Writeable
    partItem.serialNo = ""; // Writeable
    //partItem.preModWeight = ""; // Writeable
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
    return partItem;
  }

  // calculateWeight() {
  //   if(this.childItem == true) {
  //     var parentItem: PartModel = this.parts.filter(x => {return x.id == this.partItem.parentId})[0];
  //     console.log("old " + parentItem.preModWeight);
  //     var calculatedWorth = (+this.parentWeight - +this.childWeight).toString(); //parentItem.preModWeight
  //       parentItem.preModWeight = calculatedWorth.replace(/./i,","); // set parent weight back to ,
  //       console.log("new " + parentItem.preModWeight);
  //       this.partService.updatePart(parentItem);
  //       console.log(parentItem);
  //   }
  // }

  getPartId(): string {
    return this.partItem.id;
  }

  async segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }
}
