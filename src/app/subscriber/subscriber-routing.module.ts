import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteNames } from '../shared/constants';
import { SubscriberComponent } from './subscriber.component';
import { AuthGuard } from '../auth-guard.service';
import { SubscriberListComponent } from './subscriber-list/subscriber-list.component';
import { SubscriberGroupListComponent } from './subscriber-group-list/subscriber-group-list.component';
import { SubscriberFormComponent } from './subscriber-form/subscriber-form.component';
import { SubscriberGroupFormComponent } from './subscriber-group-form/subscriber-group-form.component';
import { SubscriberImportComponent } from './subscriber-import/subscriber-import.component';
import { SubscriberExportComponent } from './subscriber-export/subscriber-export.component';

const routes: Routes = [
  {
    path: RouteNames.subscriber,
    redirectTo: `${RouteNames.subscriber}/${RouteNames.subscriberList}`,
    pathMatch: 'full'
  },
  {
    path: RouteNames.subscriber,
    component: SubscriberComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: RouteNames.subscriberList,
        component: SubscriberListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberForm,
        component: SubscriberFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberFormEdit,
        component: SubscriberFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberGroupList,
        component: SubscriberGroupListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberGroupForm,
        component: SubscriberGroupFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberGroupFormEdit,
        component: SubscriberGroupFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberImport,
        component: SubscriberImportComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.subscriberExport,
        component: SubscriberExportComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriberRoutingModule { }
