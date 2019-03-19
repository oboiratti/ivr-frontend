import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './auth-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { RouteNames } from "./shared/constants";
import { SubscriberListComponent } from './subscriber/subscriber-list/subscriber-list.component';
import { SubscriberComponent } from './subscriber/subscriber.component';

const routes: Routes = [
  {
    path: RouteNames.login,
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: RouteNames.dashboard,
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  // {
  //   path: RouteNames.settings,
  //   component: SettingsComponent,
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: RouteNames.genericSettings,
  //   component: GeneralLookupComponent,
  //   canActivate: [AuthGuard]
  // },
  {
    path: '',
    redirectTo: `/${RouteNames.dashboard}`,
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
