import { Component, OnInit } from '@angular/core';
import { PartModel } from 'src/app/models/part/partmodel';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { PartService } from 'src/app/services/part/part.service';
import { Observable } from 'rxjs';
import { PartsPage } from '../parts/parts.page';

@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {
  id: string;
  partItem: PartModel;
  selectedSegment: string;

  constructor(private router: Router, private route: ActivatedRoute, private partService: PartService, private plt: Platform) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id == "-1") {
      this.partItem = new PartModel();
    }
    this.selectedSegment = "comment";
    this.plt.ready().then(() => {
      this.loadData(true);
    })
  }

  getPartId(): string {
    return this.id;
  }
    getId() {
        return this.id;
    }
  createNewPartItem() {

  }

  loadData(refresh = false) {
    let partItem: PartModel;
    this.partService.getParts(refresh, this.id).subscribe(e => {
      partItem = e[this.id];
      partItem.statusEdit = "1";
      this.partItem = partItem;
      // this.partService.updatePart(partItem, this.id);
    });
  }
  onSave() {
    this.partService.updatePart(this.partItem, this.id).subscribe(e => {
      this.partItem = e[this.id];
    });
  }

  async segmentChanged(event) {
    this.selectedSegment = event.detail.value;
  }


}
