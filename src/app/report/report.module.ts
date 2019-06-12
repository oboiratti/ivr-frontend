import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report/report.component';
import { SharedModule } from '../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgSelectModule,
    ReportRoutingModule
  ]
})
export class ReportModule { }
