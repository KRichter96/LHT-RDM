import { Component, OnInit } from '@angular/core';
import {ProjectService} from '../../services/project/project.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  projectId: string;

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.projectId = this.projectService.getProjectId();
  }

}
