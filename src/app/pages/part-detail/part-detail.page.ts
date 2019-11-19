import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PartModel } from 'src/app/models/part/partmodel';
import { PartsPage } from '../parts/parts.page';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { PartService } from 'src/app/services/part/part.service';

@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {
  partItem: Observable<PartModel>;
  id: string;

  constructor(private router: Router, private route: ActivatedRoute, private partService: PartService, private plt: Platform) { 
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.plt.ready().then(() => {
      this.loadData(true);
      
    })
  }

  loadData(refresh = false) {
    this.partService.getParts(refresh, this.id).subscribe(e => {
      this.partItem = e[this.id];
      console.log(e[this.id])
    }); /*subscribe(res => {
      this.partItem = res[this.id];
      console.log("peace: " + res[this.id]);
      if (refresher) {
        refresher.target.complete();
      }
    });*/
    //this.partItem.statusEdit = "1";
    console.log("PartItem: " + this.partItem);
    //this.repoService.updatePart(this.partItem);
  }

  waitForData(partItem: PartModel) {
    //this.partItem = partItem;
    //this.identificationNumber = this.partItem.counterId;
    //this.partItem.statusEdit = true;
    //console.log(this.partItem.statusEdit);
  }
  onSave(data) {
    this.partService.updatePart(data).subscribe();
  }
}
