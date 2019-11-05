import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { from } from 'rxjs';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  data: any;

  constructor(private router: Router) { 
  }

  ngOnInit() {
    fetch('../../../assets/data.json').then(res => res.json()).then(json => {
      this.data = json;
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
