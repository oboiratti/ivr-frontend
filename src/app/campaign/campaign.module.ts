import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignRoutingModule } from './campaign-routing.module';
import { CampaignComponent } from './campaign.component';
import { SharedModule } from '../shared/shared.module';
import { OutboundListComponent } from './outbound-list/outbound-list.component';
import { OutboundFormComponent } from './outbound-form/outbound-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';
import { OutboundResultsComponent } from './outbound-results/outbound-results.component';
import { TreeResultsComponent } from './tree-results/tree-results.component';
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
  declarations: [
    CampaignComponent,
    OutboundListComponent,
    OutboundFormComponent,
    ScheduleListComponent,
    ScheduleFormComponent,
    OutboundResultsComponent,
    TreeResultsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CampaignRoutingModule,
    BlockUIModule.forRoot()
  ]
})
export class CampaignModule { }
