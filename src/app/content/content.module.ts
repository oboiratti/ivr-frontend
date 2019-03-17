import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { ContentComponent } from './content.component';
import { SharedModule } from '../shared/shared.module';
import { TreeListComponent } from './tree-list/tree-list.component';
import { MediaLibraryComponent } from './media-library/media-library.component';

@NgModule({
  declarations: [ContentComponent, TreeListComponent, MediaLibraryComponent],
  imports: [
    CommonModule,
    SharedModule,
    ContentRoutingModule
  ]
})
export class ContentModule { }
