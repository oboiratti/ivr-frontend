import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './page-header/page-header.component';
import { ReactiveFormsModule, FormsModule } from '../../../node_modules/@angular/forms';
import { ValidateFormDirective } from './directives/validate-form.directive';
import { SearchComponent } from './search/search.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    PageHeaderComponent,
    ValidateFormDirective,
    SearchComponent
  ],
  exports: [
    PageHeaderComponent,
    ValidateFormDirective,
    SearchComponent
  ]
})
export class SharedModule { }
