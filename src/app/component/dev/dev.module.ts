import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DevComponent} from './dev.component';
import {RouterModule, Routes} from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {DevPartDetailsComponent} from './dev-part-details/dev-part-details.component';
import {DevImageDetailsComponent} from './dev-image-details/dev-image-details.component';


const routes: Routes = [
  {
    path: '',
    component: DevComponent,
  },
  {
    path: 'part-req-details',
    component: DevPartDetailsComponent
  },
  {
    path: 'image-req-details',
    component: DevImageDetailsComponent
  }
];


@NgModule({
  declarations: [
    DevComponent,
    DevPartDetailsComponent,
    DevImageDetailsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class DevModule { }
