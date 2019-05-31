import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { BlockUIModule } from 'ng-block-ui';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgSelectModule,
    BlockUIModule.forRoot()
  ]
})
export class DashboardModule { }
