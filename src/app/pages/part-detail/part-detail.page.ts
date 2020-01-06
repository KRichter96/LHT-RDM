import { Component, OnInit } from '@angular/core';
import { PartModel } from 'src/app/models/part/partmodel';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { PartService } from 'src/app/services/part/part.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {
  id: number;
  projectId: number;
  partItem: PartModel;
  selectedSegment: string;
  existingItem: boolean;

  constructor(private projectService: ProjectService, private toastCtrl: ToastService, private route: ActivatedRoute, private partService: PartService, private plt: Platform) {
  }

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id') - 1;
    this.projectId = this.projectService.getProjectId();
    if (this.id == -1) {
      this.partItem = new PartModel();
      this.createNewPartItem();
    }
    this.selectedSegment = "comment";
    this.plt.ready().then(() => {
      this.loadData(true);
    })
  }

  createNewPartItem() {
    this.existingItem = false;
  }

  loadData(refresh = false) {
    let partItem: PartModel;
    this.partService.getParts(refresh, this.projectId).subscribe(e => {
      partItem = e[this.id];
      //partItem.statusEdit = "1";
      this.partItem = partItem;
      // this.partService.updatePart(partItem, this.id);
    });
  }
  onSave() {
    this.partService.updatePart(this.partItem, this.id);
    if (+this.partItem.id === -1) { //check if partItem.id is filled else this.id
      this.partItem.id = Date.now().toString();
      this.partService.setParts(false, this.partItem.id, this.partItem);
      this.partService.updatePart(this.partItem, this.partItem.id).subscribe(e => {
        this.partItem = e[this.partItem.id];
      });
    } else {

    }
  }

  getPartId(): string {
    return this.partItem.id;
  }

  async segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }

}
