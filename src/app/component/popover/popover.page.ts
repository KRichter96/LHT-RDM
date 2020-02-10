import {Component, OnInit} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {PartService} from '../../services/part/part.service';
import {PartModel} from '../../models/part/partmodel';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {
  childItem: false;
  id: string;
  parentId: -1;
  newId: number;
  parts: PartModel[] = [];

  constructor(private navParams: NavParams, private popoverController: PopoverController,
              private partService: PartService) { }

  ngOnInit() {
    this.id = this.navParams.get('custom_id');
    this.childItem = false;
    this.parentId = -1;
    this.loadData();
  }

  loadData() {
    this.partService.getParts(this.id).subscribe(res => {
      this.parts = res.filter(part => part.parentId === '-1');

      let highesIDtmp = 0;
      for (const part of res) {
        if (highesIDtmp < part.counterId) {
          highesIDtmp = part.counterId;
        }
      }

      this.newId = highesIDtmp + 1;
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
