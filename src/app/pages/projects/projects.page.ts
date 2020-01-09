import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { Platform } from '@ionic/angular';
import { ProjectService } from 'src/app/services/project/project.service';
import {PartModel} from '../../models/part/partmodel';
import { OfflineService } from 'src/app/services/offline/offline.service';
import {PartService} from '../../services/part/part.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

  constructor(private plt: Platform, private projectService: ProjectService, private offlineManager: OfflineService, private storage: Storage, private partService: PartService) { }

  //projects: ProjectModel[] = [];
  parts: PartModel[] = [];
  projects: Observable<ProjectModel>;
  projectTitle: Observable<String>;

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadData();
    })
  }

  loadData() {
    this.projectService.getProjects().subscribe(res => this.projects = res );
  }

  checkStatus(project) {
    return 50;
  }

  deleteData() {
    //this.offlineManager.checkForEvents().subscribe(() => { this.storage.clear() });
  }
  // checkStatus() {
  //   this.partService.getOfflineParts().subscribe(res => {
  //     this.parts = res;
  //     let cento = this.parts.length;
  //     let percent = this.parts.filter(x => ((x.rackNo != "N/A" && x.rackLocation != "N/A" && x.preModWeight != "N/A")
  //         || (x.rackNo != "" && x.rackLocation != "" && x.preModWeight != "")) && (x.existingComponents != "" && x.preModPNAC != "" && x.serialNo != "")).length;
  //     let progress = percent / cento;
  //     console.log(progress);
  //     return progress;
  //   });
  // }
}
