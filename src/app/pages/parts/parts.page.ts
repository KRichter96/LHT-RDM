import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { from, Observable } from 'rxjs';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';
import { PartModel } from 'src/app/models/part/partmodel';
import { PartDetailPage } from '../part-detail/part-detail.page';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  parts: Observable<PartModel[]>;
  searchTerm: string = "";
  id: any;

  constructor(private route: ActivatedRoute, private repoService : ServerRepositoryService, private plt: Platform) { 

  }
  
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.plt.ready().then(() => {
      this.loadData(true);
      this.setFilteredItems();
    })
  }

  setFilteredItems() {
    this.parts = this.repoService.filterItems(this.searchTerm);
  }

  loadData(refresh = false, refresher?) {
    this.repoService.getParts(refresh, this.id).subscribe(res => {
      this.parts = res;
      console.log(this.parts)
      if (refresher) {
        refresher.target.complete();
      }
    })
  }

  onOpenBarcode() {

  }
  
  onSync(counterId) {
    this.repoService.updatePart(counterId, 'Parts').subscribe();
  }

  onAddItem() {
    //this.router.navigate();
  }

  onClean() {
    
  }

}
