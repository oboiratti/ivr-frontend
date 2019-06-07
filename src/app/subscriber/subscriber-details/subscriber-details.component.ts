import { Component, OnInit } from '@angular/core';
import { finalize, shareReplay } from 'rxjs/operators';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriberService } from '../shared/subscriber.service';
import { Observable } from 'rxjs';
import { Subscriber, SubscriberCallLogsQuery } from '../shared/subscriber.model';
import { RouteNames } from 'src/app/shared/constants';
import { DateHelpers } from 'src/app/shared/utils';

@Component({
  selector: 'app-subscriber-details',
  templateUrl: './subscriber-details.component.html',
  styleUrls: ['./subscriber-details.component.scss']
})
export class SubscriberDetailsComponent implements OnInit {

  @BlockUI() blockUi: NgBlockUI
  @BlockUI('calllogs') blockCallLogs: NgBlockUI
  subscriber$: Observable<Subscriber>
  callLogs$: Observable<any>
  callLogFilters$: Observable<any>
  filter = <SubscriberCallLogsQuery>{};
  name = ''
  lastFilter: SubscriberCallLogsQuery;
  pageSizes = [10, 20, 50, 100]
  totalRecords = 0;
  currentPage = 1;
  size = this.pageSizes[1];

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    const id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (id) {
      this.getSubscriberDetails(id)
      this.getSubscriberCallLogs(<SubscriberCallLogsQuery>{ subscriberId: id })
      this.getCallLogsFilters(id)
    }
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberList}`)
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberForm}/${id}`);
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.page = page;
    this.blockUi.start('Loading...');
    this.callLogs$ = this.subscriberService.getSubscriberCallLogs(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  getSubscriberCallLogs(filter: SubscriberCallLogsQuery) {
    filter.page = filter.page || 1
    filter.size = filter.size || this.size
    this.lastFilter = Object.assign({}, filter);
    this.blockCallLogs.start('Loading...');
    this.callLogs$ = this.subscriberService.getSubscriberCallLogs(filter).pipe(
      finalize(() => {
        this.totalRecords = this.subscriberService.totalCallLogs
        this.blockCallLogs.stop()
      })
    );
  }

  pageSizeChangeEvent() {
    this.filter.page = 1
    this.filter.size = this.size
    this.getSubscriberCallLogs(this.filter)
  }

  secondsToTime(seconds: number) {
    return DateHelpers.secondsToTime(seconds)
  }

  setStatusColor(status: string) {
    switch (status) {
      case 'PROCESSED': return 'badge badge-success'
      case 'PENDING': return 'badge badge-secondary'
      case 'INCOMPLETE': return 'badge badge-warning'
      case 'EXPIRED': return 'badge badge-danger'
      default: return 'badge badge-primary'
    }
  }

  private getSubscriberDetails(id: number) {
    this.blockUi.start('Loading...')
    this.subscriber$ = this.subscriberService.getSubscriberDetails(id)
      .pipe(
        finalize(() => this.blockUi.stop())
      )
  }

  private getCallLogsFilters(id: number) {
    this.blockUi.start('Loading...')
    this.callLogFilters$ = this.subscriberService.getCallLogsFilterList(id)
      .pipe(finalize(() => this.blockUi.stop()))
  }
}
