import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './page-header/page-header.component';
import { ReactiveFormsModule, FormsModule } from '../../../node_modules/@angular/forms';
import { ValidateFormDirective } from './directives/validate-form.directive';
import { SearchComponent } from './search/search.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { RouterModule } from '@angular/router';
import { FilterComponent } from './filter/filter.component';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { ReportFilterComponent } from './report-filter/report-filter.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthorizeDirective } from './directives/authorize.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgSelectModule
  ],
  declarations: [
    PageHeaderComponent,
    ValidateFormDirective,
    SearchComponent,
    SubmenuComponent,
    FilterComponent,
    DynamicTableComponent,
    ReportFilterComponent,
    AuthorizeDirective
  ],
  exports: [
    PageHeaderComponent,
    ValidateFormDirective,
    SearchComponent,
    SubmenuComponent,
    FilterComponent,
    DynamicTableComponent,
    ReportFilterComponent,
    AuthorizeDirective,
    NgbPaginationModule
  ]
})
export class SharedModule { }
