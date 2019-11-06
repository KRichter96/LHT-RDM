import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { from, Observable } from 'rxjs';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';
import { PartModel } from 'src/app/models/part/partmodel';
import { PartDetailPage } from '../part-detail/part-detail.page';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  parts: Observable<PartModel>;

  constructor(private router: Router, private repoService : ServerRepositoryService) { 

  }
  
  ngOnInit() {
    this.repoService.getData().then(prejectModelObj => {
      this.parts = prejectModelObj.parts;
    });
    
  }
  
  openDetail() {
    //this.router.navigate("/part-detail");
  }
  
  onSync() {
    
  }

  onAddItem() {
    //this.router.navigate();
  }

  onClean() {
    
  }

}
