import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { AppRoutingModule } from '../app-routing.module';
import { SidenavComponent } from './sidenav/sidenav.component';

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule
  ],
  exports: [
    AppRoutingModule,
    NavbarComponent,
    SidenavComponent
  ],
  declarations: [NavbarComponent, SidenavComponent]
})
export class CoreModule { }
