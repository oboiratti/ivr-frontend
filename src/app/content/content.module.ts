import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { ContentComponent } from './content.component';
import { SharedModule } from '../shared/shared.module';
import { TreeListComponent } from './tree-list/tree-list.component';
import { AudioLibraryComponent } from './audio-library/audio-library.component';

@NgModule({
  declarations: [ContentComponent, TreeListComponent, AudioLibraryComponent],
  imports: [
    CommonModule,
    SharedModule,
    ContentRoutingModule
  ]
})
export class ContentModule { }
