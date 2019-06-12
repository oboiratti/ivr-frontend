import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteNames } from '../shared/constants';
import { ReportComponent } from './report/report.component';
import { AuthGuard } from '../auth-guard.service';

const routes: Routes = [
  {
    path: RouteNames.reports,
    component: ReportComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
