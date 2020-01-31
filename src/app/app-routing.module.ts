import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'projects', loadChildren: './pages/projects/projects.module#ProjectsPageModule' },
  { path: 'parts/:id', loadChildren: './pages/parts/parts.module#PartsPageModule' },
  { path: 'part-detail/:id', loadChildren: './pages/part-detail/part-detail.module#PartDetailPageModule' },
  { path: 'part-detail/:newid', loadChildren: './pages/part-detail/part-detail.module#PartDetailPageModule' },
  { path: 'popover', loadChildren: './component/popover/popover.module#PopoverPageModule' },
  { path: 'help', loadChildren: './pages/help/help.module#HelpPageModule' },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
