import { Component, OnInit } from '@angular/core';
import {ProjectService} from '../../services/project/project.service';
import {PartDetailPage} from '../../pages/part-detail/part-detail.page';
import {PartModel} from '../../models/part/partmodel';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {

  comment: string;
  commentPath = "";
  partId: number;
  projectId: number;
  partItem: PartModel;


  constructor(private projectService: ProjectService, private partDetail: PartDetailPage,) { }

  ngOnInit() {
    console.log("comment:" + this.partDetail.partItem.remarksRemoval);
    this.partId = this.partDetail.id;
    console.log("comment:" + this.partDetail.partItem.remarksRemoval);
    this.comment = this.partDetail.partItem.remarksRemoval;
    this.projectId = this.projectService.getProjectId();
    this.commentPath = "comment/" + this.projectId + "/" + this.partId;
    console.log(this.comment);

  }
}
