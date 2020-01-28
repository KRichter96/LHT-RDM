import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PartDetailPage } from './part-detail.page';

import { PhotoComponent } from '../../component/photo/photo.component';
import { CommentComponent } from '../../component/comment/comment.component';
import { FindingComponent } from '../../component/finding/finding.component';

const routes: Routes = [
  {
    path: '',
    component: PartDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PartDetailPage, PhotoComponent, CommentComponent, FindingComponent]
})
export class PartDetailPageModule {}
