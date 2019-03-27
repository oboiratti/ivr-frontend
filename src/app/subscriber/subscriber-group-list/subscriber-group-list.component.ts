import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscriberGroup, SubscriberGroupQuery, SubscriberQuery } from '../shared/subscriber.model';
import { Observable, Subscription, Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SubscriberService } from '../shared/subscriber.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';

@Component({
  selector: 'app-subscriber-group-list',
  templateUrl: './subscriber-group-list.component.html',
  styleUrls: ['./subscriber-group-list.component.scss']
})
export class SubscriberGroupListComponent implements OnInit, OnDestroy {

  subscriberGroups$: Observable<SubscriberGroup[]>
  @BlockUI() blockUi: NgBlockUI
  unsubscribe$ = new Subject<void>()
  filter = <SubscriberGroupQuery>{}
  lastFilter: SubscriberGroupQuery;
  pageSizes = [10, 20, 50, 100]
  totalRecords = 0;
  currentPage = 1;
  size = this.pageSizes[1];

  constructor(private router: Router,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    this.getSubscriberGroups(<SubscriberGroupQuery>{})
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberGroupForm}/${id}`)
  }

  delete(id: number) {
    MessageDialog.confirm('Delete Group', 'Are you sure you want to delete this group?').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deleting...')
        this.subscriberService.deleteSubscriberGroup(id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
          this.blockUi.stop()
          this.getSubscriberGroups(<SubscriberGroupQuery>{})
        }, () => this.blockUi.stop())
      }
    })
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.pager.page = page;
    this.blockUi.start('Loading...');
    this.subscriberGroups$ = this.subscriberService.querySubscriberGroups(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  getSubscriberGroups(filter: SubscriberGroupQuery) {
    filter.pager = filter.pager || { page: 1, size: this.size };
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start('Loading...')
    this.subscriberGroups$ = this.subscriberService.querySubscriberGroups(filter).pipe(
      finalize(() => {
        this.totalRecords = this.subscriberService.totalGroups
        this.blockUi.stop()
      })
    )
  }

  pageSizeChangeEvent() {
    this.filter.pager = { page: 1, size: this.size }
    this.getSubscriberGroups(this.filter)
  }
}
