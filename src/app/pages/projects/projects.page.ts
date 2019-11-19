import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { Platform } from '@ionic/angular';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

  constructor(private plt: Platform, private projectService: ProjectService) { }

  projects: Observable<ProjectModel>;
  projectTitle: Observable<String>;

  ngOnInit() {
    /*
    this.serverRepoService.getData().then(projectModelObj => {
      this.projects = projectModelObj;
    });*/
    this.plt.ready().then(() => {
      this.loadData(true);
    })
  }

  loadData(refresh = false, refresher?) {
    this.projectService.getProjects(refresh).subscribe(res => {
      this.projects = res;
      if (refresher) {
        refresher.targer.complete();
      }
    });
    /*
    this.repoService.getProjects(refresh).subscribe(res => {
      this.projects = res;
      if (refresher) {
        refresher.targer.complete();
      }
    })
    */
  }
}
