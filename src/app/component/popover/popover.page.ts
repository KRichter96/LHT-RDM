import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {
  childItem: false;
  id: number;
  parentId: -1;

  constructor(private navParams: NavParams, private popoverController: PopoverController) { }

  ngOnInit() {
    this.childItem = false;
    this.parentId = -1;
  }

  closePopover() {
    this.popoverController.dismiss();
  }
}
