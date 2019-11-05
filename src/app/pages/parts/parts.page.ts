import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.page.html',
  styleUrls: ['./parts.page.scss'],
})
export class PartsPage implements OnInit {

  data: any;

  constructor() { 
  }

  ngOnInit() {
    fetch('../../../assets/data.json').then(res => res.json()).then(json => {
      this.data = json;
    });
  }
  
  onSync() {
    
  }

  onAddItem() {

  }

  onClean() {
    
  }

}
