import { Component, OnInit, Input } from '@angular/core';
import { ProgressHolder } from 'src/app/pages/projects/progress.holder';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
})
export class ProgressComponent implements OnInit {

  @Input('progress') progress: ProgressHolder;

  constructor() { }

  ngOnInit() {}

}
