import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';
import { PartModel } from 'src/app/models/part/partmodel';
import { PartsPage } from '../parts/parts.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {
  partItem: PartModel;
  id: string;

  identificationNumber =  null;

  constructor(private router: Router, private route: ActivatedRoute, private repoService: ServerRepositoryService) { }

  ngOnInit() {
  this.id = this.route.snapshot.paramMap.get('id');

//  this.repoService.getData().then(partModelObj => {
//    this.partItem = partModelObj.parts[id];
//  });
  }
}
