import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { from, Observable } from 'rxjs';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';
import { PartModel } from 'src/app/models/part/partmodel';
import { PartDetailPage } from '../part-detail/part-detail.page';
import { Platform } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  parts: Observable<PartModel[]>;
  searchTerm: string = "";
  id: any;

  constructor(private route: ActivatedRoute, private repoService : ServerRepositoryService, private plt: Platform, private barcodeScanner: BarcodeScanner) { 

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
    });
  }

  onOpenBarcode() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.searchTerm = barcodeData.text;
    })
  }

  delete() {
    
  }

  onClean() {
    
  }

  onAddItem() {
    //this.router.navigate();
  }
  
  onSync() {
    this.repoService.updatePart('Parts').subscribe();
  }

}
