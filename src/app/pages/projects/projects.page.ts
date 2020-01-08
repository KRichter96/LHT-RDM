import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { Platform } from '@ionic/angular';
import { ProjectService } from 'src/app/services/project/project.service';
import {PartModel} from '../../models/part/partmodel';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

  constructor(private plt: Platform, private projectService: ProjectService) { }

  //projects: ProjectModel[] = [];
  projects: Observable<ProjectModel>;
  projectTitle: Observable<String>;

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadData(true);
    })
  }

  loadData(refresh = false, refresher?) {
    this.projectService.getProjects().subscribe(res => {
      this.projects = res;
      if (refresher) {
        refresher.target.complete();
      }
    });
  }

  checkStatus(project) {
    return 50;
  }
}
