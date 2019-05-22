import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CampaignQuery, CampaignScheduleQuery, Campaign } from '../shared/campaign.models';
import { Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from '../shared/campaign.service';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';
import { finalize, takeUntil } from 'rxjs/operators';
import { Lookup } from 'src/app/shared/common-entities.model';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss']
})
export class ScheduleListComponent implements OnInit, OnDestroy {

  campaignSchedules$: Observable<any>
  unsubscribe$ = new Subject<void>()
  @BlockUI() blockUi: NgBlockUI
  lastFilter: CampaignScheduleQuery
  title = ''
  filter = <CampaignScheduleQuery>{}
  campaignId: number
  pageSizes = [10, 20, 50, 100]
  totalRecords = 0;
  currentPage = 1;
  size = this.pageSizes[1];
  topics$: Observable<Lookup>
  recipientTypes = ['AllSubscribers', 'SelectedGroups', 'SelectedSubscribers']
  scheduleTypes = ['Now', 'FixedDate', 'Repeating']
  campaign: Campaign

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    if (this.campaignId) {
      this.findCampaign(this.campaignId)
      this.getCampaignSchedules(<CampaignScheduleQuery>{})
    }
    this.loadTopics()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.campaignId}/${RouteNames.schedules}/${RouteNames.sform}/${id}`)
  }

  delete(id: number) {
    MessageDialog.confirm('Delete Campaign Schedule', 'Are you sure you want to delete this campaign schedule?').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deleting...')
        this.campaignService.deleteCampaignSchedule(id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(res => {
            this.blockUi.stop()
            if (res.success) { this.getCampaignSchedules(<CampaignScheduleQuery>{}) }
          }, () => this.blockUi.stop())
      }
    })
  }

  gotoSchedule(id: number) {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${id}/${RouteNames.schedules}`)
  }

  results(id: number) {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.campaignId}/${RouteNames.scheduleResults}/${id}`)
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.pager.page = page;
    this.blockUi.start('Loading...')
    this.campaignSchedules$ = this.campaignService.queryCampaignSchedules(this.lastFilter)
      .pipe(
        finalize(() => this.blockUi.stop())
      )
  }

  getCampaignSchedules(filter: CampaignScheduleQuery) {
    filter.campaignId = this.campaignId
    filter.pager = filter.pager || { page: 1, size: this.size };
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start('Loading...')
    this.campaignSchedules$ = this.campaignService.queryCampaignSchedules(filter)
      .pipe(
        finalize(() => {
          this.totalRecords = this.campaignService.totalCampaignSchedules
          this.blockUi.stop()
        })
      )
  }

  pageSizeChangeEvent() {
    this.filter.pager = { page: 1, size: this.size }
    this.getCampaignSchedules(this.filter)
  }

  private loadTopics() {
    this.topics$ = this.settingsService.fetch2('pillar')
  }

  private findCampaign(id: number) {
    this.campaignService.findCampaign(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res.success) {
          this.campaign = res.data
        }
      })
  }
}
