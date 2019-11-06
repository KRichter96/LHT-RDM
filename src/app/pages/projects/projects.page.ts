import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

  constructor(private serverRepoService : ServerRepositoryService) { }

  projects: Observable<ProjectModel>;
  projectTitle: Observable<String>;

  ngOnInit() {
    this.serverRepoService.getData().then(prejectModelObj => {
      this.projects = prejectModelObj;
    });
  }
}
