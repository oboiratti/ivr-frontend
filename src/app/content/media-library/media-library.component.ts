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
  audioEl: any;
  audioElSource: any;
  pageSizes = [10, 20, 50, 100]
  totalRecords = 0;
  currentPage = 1;
  size = this.pageSizes[1];
  languages$: Observable<Lookup[]>;
  types = ['Message', 'Survey'];
  currentRecId: number;

  constructor(private router: Router,
    private mediaService: MediaService) { }

  ngOnInit() {
    this.status = 'Active';
    this.activeTab = 'Active';
    this.audioEl = document.getElementById('audio_el');
    this.audioElSource = document.getElementById('audio_el_source');
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

  getMedia(filter: MediaQuery) {
    filter.pager = filter.pager || { page: 1, size: this.size };
    filter.status = this.status;
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start('Loading Library...');
    this.records$ = this.mediaService.queryMedia(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  pageSizeChangeEvent() {
    this.lastFilter.pager = { page: 1, size: this.size }
    this.getMedia(this.lastFilter)
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
    this.stopCurrent();
    this.currentRecId = rec.id;
    rec.showPlay = false;
    rec.showStop = true;

    this.audioElSource.src = rec.fileUrl;
    this.audioEl.load();
    // this.audioEl.loop = true;
    this.audioEl.play();
    this.audioEl.onended = function () {
      rec.showPlay = true;
      rec.showStop = false;
    };
  }
  stop(rec: any) {
    rec.showPlay = true;
    rec.showStop = false;
    this.audioEl.pause();
    this.audioEl.currentTime = 0;
  }

  stopCurrent() {
    const id = this.currentRecId;
    if (id) {
      this.records$.forEach(x =>
        x.map( r => {
          if (r.id === id) {
          r.showPlay = true;
          r.showStop = false;
          }
        }));
    }
  }
}
