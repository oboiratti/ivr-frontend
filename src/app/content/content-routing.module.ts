import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteNames } from '../shared/constants';
import { ContentComponent } from './content.component';
import { AuthGuard } from '../auth-guard.service';
import { TreeListComponent } from './tree-list/tree-list.component';
import { TreeFormComponent } from './tree-form/tree-form.component';
import { TreeDetailsComponent } from './tree-details/tree-details.component';
import { MediaLibraryComponent } from './media-library/media-library.component';
import { MediaFormComponent } from './media-form/media-form.component';
import { MediaDetailsComponent } from './media-details/media-details.component';
import { TreeStudioComponent } from './tree-studio/tree-studio.component';

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
      },
      {
        path: RouteNames.treeListForm,
        component: TreeFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.treeListDetails,
        component: TreeDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.treeListFormEdit,
        component: TreeFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.mediaLibrary,
        component: MediaLibraryComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.mediaLibraryForm,
        component: MediaFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.mediaLibraryDetails,
        component: MediaDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.mediaLibraryFormEdit,
        component: MediaFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.treeStudioForm,
        component: TreeStudioComponent,
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
