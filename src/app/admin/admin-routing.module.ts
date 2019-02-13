import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth-guard.service';
import { Route } from '../shared/constants';
import { UserComponent } from './user/user.component';
import { RoleComponent } from './role/role.component';

const routes: Routes = [
  {
    path: Route.users,
    component: UserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: Route.roles,
    component: RoleComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
