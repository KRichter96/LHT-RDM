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
  projectId: string;

  constructor(private projectService: ProjectService, private partService: PartService, private partDetail: PartDetailPage) { }

  ngOnInit() {
    this.comment = this.partDetail.partItem.remarksRemoval;
  }

  notify() {
      this.partDetail.partItem.remarksRemoval = this.comment;
  }
}
