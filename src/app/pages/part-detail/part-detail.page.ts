import { Component, OnInit } from '@angular/core';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';
import { PartModel } from 'src/app/models/part/partmodel';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-part-detail',
  templateUrl: './part-detail.page.html',
  styleUrls: ['./part-detail.page.scss'],
})
export class PartDetailPage implements OnInit {
  partItem: PartModel;
  id: string;

  constructor(
  private router: Router,
  private activatedRoute: ActivatedRoute,
  private repoService: ServerRepositoryService
  ) { }

  ngOnInit() {
  this.id = this.activatedRoute.snapshot.paramMap.get('id');
  this.repoService.getData().then(partModelObj => {
    this.waitForData(partModelObj.parts[this.id])
  });
  }

  waitForData(partItem: PartModel) {
    this.partItem = partItem;
  }
  onSave() {
  console.log("data saved");
  }
}
