import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {

  identificationNumber =  null;

  constructor() { }

  ngOnInit() {
  }

}
