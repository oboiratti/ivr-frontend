import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    BlockUIModule.forRoot()
  ]
})
export class DashboardModule { }
