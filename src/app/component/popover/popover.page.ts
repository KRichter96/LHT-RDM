import { Component, OnInit } from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {PartModel} from '../../models/part/partmodel';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from '../../services/project/project.service';
import {PartService} from '../../services/part/part.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {

  partsArray: PartModel[] = [];
  childItem: false;
  id: number;
  parentId: -1;

  constructor(private navParams: NavParams, private popoverController: PopoverController) { }

  ngOnInit() {
    this.childItem = false;
    this.parentId = -1;
    console.log(this.childItem);
    console.log(this.parentId);
  }

  closePopover() {
    this.popoverController.dismiss();
  }
}
