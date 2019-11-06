import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'projects', loadChildren: './pages/projects/projects.module#ProjectsPageModule' },
  { path: 'parts', loadChildren: './pages/parts/parts.module#PartsPageModule' },
  { path: 'part-detail/:id', loadChildren: './pages/part-detail/part-detail.module#PartDetailPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
