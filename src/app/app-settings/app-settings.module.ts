import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppSettingsRoutingModule } from './app-settings-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { GeneralLookupComponent } from './settings/general-lookup/general-lookup.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SettingsComponent, GeneralLookupComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AppSettingsRoutingModule
  ]
})
export class AppSettingsModule { }
