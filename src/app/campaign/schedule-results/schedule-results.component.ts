import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Campaign, CampaignSchedule } from '../shared/campaign.models';
import { Subject } from 'rxjs';
import { CampaignService } from '../shared/campaign.service';
import { RouteNames } from 'src/app/shared/constants';
import { Chart } from 'chart.js'

@Component({
  selector: 'app-schedule-results',
  templateUrl: './schedule-results.component.html',
  styleUrls: ['./schedule-results.component.scss']
})
export class ScheduleResultsComponent implements OnInit, OnDestroy, AfterViewInit {

  @BlockUI() blockUi: NgBlockUI
  id: number
  sid: number
  campaign: Campaign
  unsubscribe$ = new Subject<void>()
  campaignSchedule: CampaignSchedule
  completedCalls = {}
  failedCalls = {}
  hangUpCalls = {}
  scheduleScore = {}
  schedulesBar = {}
  @ViewChild('completedCallsCanvas') completedCallsCanvas: ElementRef
  @ViewChild('failedCallsCanvas') failedCallsCanvas: ElementRef
  @ViewChild('hangUpCallsCanvas') hangUpCallsCanvas: ElementRef
  @ViewChild('scheduleScoreCanvas') scheduleScoreCanvas: ElementRef
  @ViewChild('schedulesBarCanvas') schedulesBarCanvas: ElementRef

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.id = +this.activatedRoute.snapshot.paramMap.get('id')
    this.sid = +this.activatedRoute.snapshot.paramMap.get('sid')
    if (this.sid) { this.findCampaignSchedule(this.sid) }
  }

  ngAfterViewInit() {
    this.schedulesSessionSummary()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  gotoSchedule() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.id}/${RouteNames.schedules}`)
  }

  private findCampaignSchedule(id: number) {
    this.blockUi.start('Loading...')
    this.campaignService.findCampaignSchedule(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockUi.stop()
        if (res.success) {
          this.campaignSchedule = res.data
        }
      })
  }

  private makeDoughnut(obj: any, canvas: ElementRef, data: any, labels: any, text?: string, backgroundColor?: any, sidePadding?: number) {
    obj = new Chart(canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColor || ['#bf9500', '#dcedf6']
          }
        ]
      },
      options: {
        cutoutPercentage: 80,
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          center: {
            text: text || '',
            color: '#797b85',
            fontStyle: 'Helvetica',
            sidePadding: sidePadding || 60
          }
        }
      }
    })
  }

  private schedulesSessionSummary() {
    const bgColor = ['#1a79ff', '#d9d9c3']
    this.makeDoughnut(this.completedCalls, this.completedCallsCanvas, [1200, 200], ['Completed', 'Not Completed'], '1200', bgColor, 30)
    this.makeDoughnut(this.failedCalls, this.failedCallsCanvas, [100, 500], ['Failed', 'Not Failed'], '100', bgColor, 40)
    this.makeDoughnut(this.hangUpCalls, this.hangUpCallsCanvas, [90, 2000], ['Hanged Up', 'Receive'], '90', bgColor, 60)
    this.makeDoughnut(this.scheduleScore, this.scheduleScoreCanvas, [3500, 5000], ['Current', 'Total'], '3500/5000', bgColor, -30)
  }
}
