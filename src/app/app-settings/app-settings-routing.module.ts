import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppSettingsComponent } from './app-settings.component';
import { RouteNames } from '../shared/constants';
import { AuthGuard } from '../auth-guard.service';
import { SettingsComponent } from './settings/settings.component';
import { GeneralLookupComponent } from './settings/general-lookup/general-lookup.component';

const routes: Routes = [
  {
    path: RouteNames.appSettings,
    redirectTo: `${RouteNames.appSettings}/${RouteNames.settings}`,
    pathMatch: 'full'
  },
  {
    path: RouteNames.appSettings,
    component: AppSettingsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: RouteNames.settings,
        component: SettingsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: RouteNames.genericSettings,
        component: GeneralLookupComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppSettingsRoutingModule { }
