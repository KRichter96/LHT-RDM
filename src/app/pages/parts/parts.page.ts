import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { from } from 'rxjs';
import { ProjectrepositoryService } from 'src/app/services/project/projectrepository.service';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  data: any;

  constructor(private router: Router, private repoService : ProjectrepositoryService) { 
  }
  
  ngOnInit() {
    this.repoService.getData().then(prejectModelObj => {
      //hier habe ich dann meine Project Daten
      // von hier aus in die view schieben
      this.data = prejectModelObj.parts;
    });
    
  }
  
  openDetail() {
    //this.router.navigate("/part-detail");
  }
  
  onSync() {
    
  }

  onAddItem() {

  }

  onClean() {
    
  }

}
