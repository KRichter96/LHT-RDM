import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectModel } from 'src/app/models/project/ProjectModel';
import { Platform } from '@ionic/angular';
import { ProjectService } from 'src/app/services/project/project.service';
import { PartModel } from '../../models/part/partmodel';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { PartService } from '../../services/part/part.service';
import { Storage } from '@ionic/storage';

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

  doRefresh(event) {
    console.log('Begin async operation');
    this.loadData();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  loadData() {
    this.projectService.getProjects().subscribe(res => this.projects = res );
  }

  deleteData() {
    //this.offlineManager.checkForEvents().subscribe(() => { this.storage.clear() });
  }

  checkStatus(id) {
    // var items: PartModel[] = [];
    // this.partService.getParts(id).subscribe(res => {
    //   items = res;
    // });
    // console.log(items)
    // let cento = items.length;
    // let percent = items.filter(x => ((x.rackNo != "N/A" && x.rackLocation != "N/A" && x.preModWeight != "N/A")
    //     || (x.rackNo != "" && x.rackLocation != "" && x.preModWeight != "")) && (x.existingComponents != "" && x.preModPNAC != "" && x.serialNo != "")).length;
    // let progress = percent / cento;
    // return progress;
  }
}
