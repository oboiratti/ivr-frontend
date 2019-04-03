import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { SubscriberService } from '../shared/subscriber.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { Subscriber, SubscriberQuery } from '../shared/subscriber.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Lookup } from 'src/app/shared/common-entities.model';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';

@Component({
  selector: 'app-subscriber-list',
  templateUrl: './subscriber-list.component.html',
  styleUrls: ['./subscriber-list.component.scss']
})
export class SubscriberListComponent implements OnInit, OnDestroy {

  subscribers$: Observable<Subscriber[]>;
  @BlockUI() blockUi: NgBlockUI;
  unsubscribe$ = new Subject<void>();
  filter = <SubscriberQuery>{};
  name = ''
  lastFilter: SubscriberQuery;
  pageSizes = [10, 20, 50, 100]
  totalRecords = 0;
  currentPage = 1;
  size = this.pageSizes[1];
  subscriberTypes$: Observable<Lookup>

  constructor(private router: Router,
    private subscriberService: SubscriberService,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.getSubscribers(<SubscriberQuery>{});
    this.loadSubscriberTypes()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  openForm() {
    this.router.navigateByUrl(RouteNames.subscriberForm);
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberForm}/${id}`);
  }

  delete(id: number) {
    MessageDialog.confirm('Delete Subscriber', 'Are you sure you want to delete this subscriber?').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deleting...');
        this.subscriberService.deleteSubscriber(id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(res => {
            this.blockUi.stop();
            this.getSubscribers(<SubscriberQuery>{});
          }, () => this.blockUi.stop());
      }
    });
  }

  view(id: number) {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberDetails}/${id}`);
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.pager.page = page;
    this.blockUi.start('Loading...');
    this.subscribers$ = this.subscriberService.querySubscribers(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  getSubscribers(filter: SubscriberQuery) {
    filter.pager = filter.pager || { page: 1, size: this.size };
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start('Loading...');
    this.subscribers$ = this.subscriberService.querySubscribers(filter).pipe(
      finalize(() => {
        this.totalRecords = this.subscriberService.totalSubscribers
        this.blockUi.stop()
      })
    );
  }

  pageSizeChangeEvent() {
    this.filter.pager = { page: 1, size: this.size }
    this.getSubscribers(this.filter)
  }

  private loadSubscriberTypes() {
    this.subscriberTypes$ = this.settingsService.fetch2('subscribertype')
  }
}
