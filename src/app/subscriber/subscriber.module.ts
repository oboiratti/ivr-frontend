import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriberRoutingModule } from './subscriber-routing.module';
import { SubscriberComponent } from './subscriber.component';
import { SubscriberListComponent } from './subscriber-list/subscriber-list.component';
import { SubscriberGroupListComponent } from './subscriber-group-list/subscriber-group-list.component';
import { SharedModule } from '../shared/shared.module';
import { SubscriberFormComponent } from './subscriber-form/subscriber-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SubscriberGroupFormComponent } from './subscriber-group-form/subscriber-group-form.component';
import { SubscriberImportComponent } from './subscriber-import/subscriber-import.component';
import { SubscriberExportComponent } from './subscriber-export/subscriber-export.component';
import { SubscriberDetailsComponent } from './subscriber-details/subscriber-details.component';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';

@NgModule({
  declarations: [
    SubscriberComponent,
    SubscriberListComponent,
    SubscriberGroupListComponent,
    SubscriberFormComponent,
    SubscriberGroupFormComponent,
    SubscriberImportComponent, SubscriberExportComponent, SubscriberDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    InternationalPhoneNumberModule,
    SubscriberRoutingModule
  ]
})
export class SubscriberModule { }
