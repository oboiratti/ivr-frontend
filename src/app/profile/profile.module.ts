import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ProfileRoutingModule
  ],
  declarations: [ProfileComponent, ProfileFormComponent, ChangePasswordComponent]
})
export class ProfileModule { }
