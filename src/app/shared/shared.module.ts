import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './page-header/page-header.component';
import { ReactiveFormsModule, FormsModule } from '../../../node_modules/@angular/forms';
import { ValidateFormDirective } from './directives/validate-form.directive';
import { SearchComponent } from './search/search.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    PageHeaderComponent,
    ValidateFormDirective,
    SearchComponent,
    SubmenuComponent
  ],
  exports: [
    PageHeaderComponent,
    ValidateFormDirective,
    SearchComponent,
    SubmenuComponent
  ]
})
export class SharedModule { }
