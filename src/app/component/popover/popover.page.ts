import {Component, OnInit} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {PartService} from '../../services/part/part.service';
import {PartModel} from '../../models/part/partmodel';
import {ProjectService} from '../../services/project/project.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {
  childItem: false;
  parentCounterId: -1;
  newCounterId = 0;
  parts: PartModel[] = [];

  constructor(private navParams: NavParams, private popoverController: PopoverController,
              private partService: PartService, private projectService: ProjectService) { }

  ngOnInit() {
    this.childItem = false;
    this.parentCounterId = -1;
    this.loadData();
  }

  loadData() {
    this.partService.getParts(this.projectService.getProjectId()).subscribe(res => {
      this.parts = res.filter(part => part.parentId === '-1');

      let highesIDtmp = 1000;
      for (const part of res) {
        if (highesIDtmp < part.counterId) {
          highesIDtmp = part.counterId;
        }
      }

      this.newCounterId = highesIDtmp + 1;
    });
  }

  closePopover(parent?: number) {
    if (parent) {
      this.partService.parentCounterId = parent;
    } else {
      this.partService.parentCounterId = undefined;
    }
    this.popoverController.dismiss().then();
  }
}
