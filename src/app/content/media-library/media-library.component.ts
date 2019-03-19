import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { MediaService } from '../shared/media.service';
import { Observable, Subscription } from 'rxjs';
import { Media, MediaQuery } from '../shared/media.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Lookup } from 'src/app/shared/common-entities.model';

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
  activeTab: string;
  totalRecords = 0;
  currentPage = 1;
  recordSize = 20;
  totalPages = 1;
  pageNumber = 1;
  languages$: Observable<Lookup[]>;
  types = ['Message', 'Survey'];

  constructor(private router: Router,
    private mediaService: MediaService) { }

  ngOnInit() {
    this.status = 'Active';
    this.activeTab = 'Active';
    this.getMedia(<MediaQuery>{});
    this.loadLanguages();
  }

  ngOnDestroy() {
    if (this.deleteMedia) { this.deleteMedia.unsubscribe(); }
  }

  changeTab(tab: string) {
    this.status = tab;
    this.activeTab = tab;
    this.getMedia(<MediaQuery>{});
  }

  openForm() {
    this.router.navigateByUrl(RouteNames.mediaLibraryForm);
  }

  open(id: number) {
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.mediaLibraryDets}/${id}`);
  }

  private loadLanguages() {
    this.languages$ = this.mediaService.fetchLanguages();
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

  setLabel(type: string) {
    switch (type) {
        case 'Message':
            return 'label-primary';
        case 'Survey':
            return 'label-default';
        default:
            return 'label-danger';
    }
}

  play(rec: any) {
    const audioControl: any = document.getElementById('audio_' + rec.id);
    audioControl.loop = true;
    audioControl.play();
  }
  stop(rec: any) {
    const audioControl: any = document.getElementById('audio_' + rec.id);
    audioControl.pause();
    audioControl.currentTime = 0;
  }
}
