import { Component, OnInit } from '@angular/core';
import {ProjectService} from '../../services/project/project.service';
import {PartDetailPage} from '../../pages/part-detail/part-detail.page';
import {PartModel} from '../../models/part/partmodel';
import {PartService} from '../../services/part/part.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {

  comment: string;
  projectId: number;

  constructor(private projectService: ProjectService, private partService: PartService, private partDetail: PartDetailPage) { }

  ngOnInit() {
    this.comment = this.partDetail.partItem.remarksRemoval;
    this.projectId = this.projectService.getProjectId();
    this.partService.getParts(false, this.projectId);
  }

  notify() {
      this.partDetail.partItem.remarksRemoval = this.comment;
      console.log("Updated remarksRemoval: " + this.partDetail.partItem.remarksRemoval);
  }
}
