import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteNames } from '../shared/constants';
import { ContentComponent } from './content.component';
import { AuthGuard } from '../auth-guard.service';
import { TreeListComponent } from './tree-list/tree-list.component';

const routes: Routes = [
  {
    path: RouteNames.content,
    redirectTo: `${RouteNames.content}/${RouteNames.treeList}`,
    pathMatch: 'full'
  },
  {
    path: RouteNames.content,
    component: ContentComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: RouteNames.treeList,
        component: TreeListComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
