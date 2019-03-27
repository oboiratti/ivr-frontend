import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteNames } from '../shared/constants';
import { CampaignComponent } from './campaign.component';
import { AuthGuard } from '../auth-guard.service';
import { OutboundListComponent } from './outbound-list/outbound-list.component';
import { OutboundFormComponent } from './outbound-form/outbound-form.component';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';

const routes: Routes = [
  {
    path: RouteNames.campaign,
    redirectTo: `${RouteNames.campaign}/${RouteNames.outbound}`,
    pathMatch: 'full'
  },
  {
    path: RouteNames.campaign,
    component: CampaignComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: RouteNames.outbound,
        component: OutboundListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.outboundForm,
        component: OutboundFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.outboundFormEdit,
        component: OutboundFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.schedulesWithId,
        component: ScheduleListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.scheduleForm,
        component: ScheduleFormComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule { }
