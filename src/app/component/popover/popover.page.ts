import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import {PartService} from '../../services/part/part.service';
import {PartModel} from '../../models/part/partmodel';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {
  childItem: false;
  id: number;
  parentId: -1;
  parts: PartModel[] = [];

  constructor(private navParams: NavParams, private popoverController: PopoverController, private partService: PartService) { }

  ngOnInit() {
    this.id = this.navParams.get('custom_id');
    this.childItem = false;
    this.parentId = -1;
    this.loadData();
  }

  loadData() {
    this.partService.getParts(this.id).subscribe(res => {
      this.parts = res;
    });
  }

  closePopover() {
    this.popoverController.dismiss();
  }
}
