import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { Platform } from '@ionic/angular';
import { ProjectService } from 'src/app/services/project/project.service';
import { PartModel } from '../../models/part/partmodel';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { PartService } from '../../services/part/part.service';
import { Storage } from '@ionic/storage';
import { ProgressHolder } from './progress.holder';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

  status = {};
  projects: ProjectModel[] = [];

  constructor(private plt: Platform, private projectService: ProjectService, private offlineManager: OfflineService, private storage: Storage, private partService: PartService) { }

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadData();
    })
  }

  doRefresh(event) {
    // console.log('Begin async operation');
    this.loadData();
    setTimeout(() => {
      // console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  loadData() {
    this.projectService.getProjects().subscribe(res => {
      this.projects = res;
      this.checkStatus();
    });
  }

  checkStatus() {
    for (let i = 0; i < this.projects.length; i++) {
      let p = this.projects[i];
      this.partService.getParts(p.id).subscribe((res) => {
        // console.log(res);
        if (res.length == 0) {
          if (!this.status[p.id]) {
            this.status[p.id] = new ProgressHolder();
          }
          this.status[p.id].status = 0;
        } else {
          if (!this.status[p.id]) {
            this.status[p.id] = new ProgressHolder();
          }
          let cento = res.length;
          let percent = res.filter(x => (x.rackLocation && x.rackNo && x.preModWeight && x.preModWeight != "N/A" && 
            x.rackLocation != "N/A" && x.rackNo != "N/A")).length;    
          this.status[p.id].status = Math.floor((percent / cento) * 100);
        }
      })
    }
  }
}
