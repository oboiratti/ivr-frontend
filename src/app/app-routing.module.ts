import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './auth-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { GeneralLookupComponent } from './settings/general-lookup/general-lookup.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { Route } from "./shared/constants";

const routes: Routes = [
  {
    path: Route.login,
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: Route.dashboard,
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: Route.settings,
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: Route.genericSettings,
    component: GeneralLookupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: `/${Route.dashboard}`,
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
