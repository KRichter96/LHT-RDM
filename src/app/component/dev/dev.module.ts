import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DevComponent} from './dev.component';
import {RouterModule, Routes} from '@angular/router';
import {IonicModule} from '@ionic/angular';


const routes: Routes = [
  {
    path: '',
    component: DevComponent
  }
];


@NgModule({
  declarations: [
    DevComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class DevModule { }
