import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { ServerRepositoryService } from 'src/app/services/server/serverrepository.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

  constructor(private repoService: ServerRepositoryService, private plt: Platform) { }

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
    this.repoService.getProjects(refresh).subscribe(res => {
      this.projects = res;
      if (refresher) {
        refresher.targer.complete();
      }
      console.log(this.projects[0]);
    })
  }
}
