import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { MediaService } from '../shared/media.service';
import { Observable, Subscription } from 'rxjs';
import { Media, MediaQuery } from '../shared/media.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';

@Component({
  selector: 'app-media-library',
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.scss']
})
export class MediaLibraryComponent implements OnInit, OnDestroy {

  records$: Observable<Media[]>;
  @BlockUI() blockUi: NgBlockUI;
  deleteMedia: Subscription;
  lastFilter: MediaQuery;
  status: string;
  totalRecords = 0;
  currentPage = 1;
  recordSize = 20;
  totalPages = 1;
  pageNumber = 1;

  constructor(private router: Router,
    private mediaService: MediaService) { }

  ngOnInit() {
    this.status = 'Active';
    this.getMedia(<MediaQuery>{});
  }

  ngOnDestroy() {
    // this.deleteMedia.unsubscribe()
  }

  openForm() {
    this.router.navigateByUrl(RouteNames.mediaLibraryForm);
  }

  open(id: number) {
    this.router.navigateByUrl(`${RouteNames.media}/${id}`);
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.mediaLibraryFormEdit}/${id}`);
  }

  delete(id: number) {
    MessageDialog.confirm('Delete Media', 'Are you sure you want to delete this media?').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deleting Media...');
        this.deleteMedia = this.mediaService.deleteMedia(id).subscribe(res => {
          this.blockUi.stop();
          this.getMedia(<MediaQuery>{});
        }, () => this.blockUi.stop());
      }
    });
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.pager.page = page;
    this.lastFilter.status = this.status;
    this.blockUi.start('Loading Library...');
    this.records$ = this.mediaService.queryMedia(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  private getMedia(filter: MediaQuery) {
    filter.pager = filter.pager || { page: 1, size: this.recordSize };
    filter.status = this.status;
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start('Loading Library...');
    this.records$ = this.mediaService.queryMedia(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }
}
