import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CampaignService } from '../shared/campaign.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { Campaign, CampaignScheduleQuery } from '../shared/campaign.models';
import { Subject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Chart } from 'chart.js'
import { RouteNames } from 'src/app/shared/constants';

@Component({
  selector: 'app-outbound-results',
  templateUrl: './outbound-results.component.html',
  styleUrls: ['./outbound-results.component.scss']
})
export class OutboundResultsComponent implements OnInit, OnDestroy, AfterViewInit {

  campaign: Campaign
  unsubscribe$ = new Subject<void>()
  campaignId: number
  @BlockUI() blockUi: NgBlockUI
  @BlockUI('trees') blockTrees: NgBlockUI
  activeDoughnut = {}
  upcomingDoughnut = {}
  hangUpDoughnut = {}
  scoreDoughnut = {}
  summaryPie = {}
  completedCalls = {}
  failedCalls = {}
  hangUpCalls = {}
  scheduleScore = {}
  schedulesBar = {}
  trees$: Observable<any>
  @ViewChild('activeCanvas') activeCanvas: ElementRef
  @ViewChild('upcomingCanvas') upcomingCanvas: ElementRef
  @ViewChild('hangUpCanvas') hangUpCanvas: ElementRef
  @ViewChild('scoreCanvas') scoreCanvas: ElementRef
  @ViewChild('pieCanvas') pieCanvas: ElementRef
  @ViewChild('completedCallsCanvas') completedCallsCanvas: ElementRef
  @ViewChild('failedCallsCanvas') failedCallsCanvas: ElementRef
  @ViewChild('hangUpCallsCanvas') hangUpCallsCanvas: ElementRef
  @ViewChild('scheduleScoreCanvas') scheduleScoreCanvas: ElementRef
  @ViewChild('schedulesBarCanvas') schedulesBarCanvas: ElementRef

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    if (this.campaignId) {
      this.findCampaign(this.campaignId)
      this.getCampaignTrees(this.campaignId)
    }
  }

  ngAfterViewInit() {
    this.campaignSummary()
    this.subscriberSummaryPie()
    this.schedulesSessionSummary()
    // this.schedulesBarChart()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  results(id: number) {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.campaignId}/${RouteNames.treeResults}/${id}`)
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

  private campaignSummary() {
    const bgColor = ['#bf9500', '#dcedf6']
    this.makeDoughnut(this.activeDoughnut, this.activeCanvas, [70, 0], ['Active', 'Inactive'], '70', bgColor, 60)
    this.makeDoughnut(this.upcomingDoughnut, this.upcomingCanvas, [4, 6], ['Upcoming', 'Completed'], '4', bgColor, 75)
    this.makeDoughnut(this.hangUpDoughnut, this.hangUpCanvas, [15, 20], ['Hanged Up', 'Receive'], '15', bgColor, 60)
    this.makeDoughnut(this.scoreDoughnut, this.scoreCanvas, [1200, 1800], ['Current', 'Total'], '1200/1800', bgColor, -50)
  }

  private schedulesSessionSummary() {
    const bgColor = ['#31b0d5', '#d9d9c3']
    this.makeDoughnut(this.completedCalls, this.completedCallsCanvas, [1200, 200], ['Completed', 'Not Completed'], '1200', bgColor, 30)
    this.makeDoughnut(this.failedCalls, this.failedCallsCanvas, [100, 500], ['Failed', 'Not Failed'], '100', bgColor, 40)
    this.makeDoughnut(this.hangUpCalls, this.hangUpCallsCanvas, [90, 2000], ['Hanged Up', 'Receive'], '90', bgColor, 60)
    this.makeDoughnut(this.scheduleScore, this.scheduleScoreCanvas, [3500, 5000], ['Current', 'Total'], '3500/5000', bgColor, -30)
  }

  private subscriberSummaryPie() {
    // this.blockCommodity.start('Loading...')
    // this.dashboardService.getCommoditySummary().subscribe(res => {
    // this.blockCommodity.stop()
    // if (res.success) {
    // const data = [];
    // const labels = [];
    // (res.data as Array<any>).map(elm => {
    //   data.push(elm.subscriberCount)
    //   labels.push(elm.commodity)
    // })

    const data = [230000, 120000]
    const labels = ['Male', 'Female']
    this.summaryPie = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#1a79ff', '#a3a1fb']
          }
        ]
      },
      options: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    })
    // }
    // }, () => this.blockCommodity.stop())

  }

  private schedulesBarChart() {
    // this.blockUi.start('Loading...')
    // this.dashboardService.getCommoditySummary().subscribe(res => {
      // this.blockUi.stop()
      // if (res.success) {
        // const data = [];
        const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'e'];
        // (res.data as Array<any>).map(elm => {
        //   data.push(elm.subscriberCount)
        //   labels.push(elm.commodity)
        // })

        const data = [20, 30, 40, 50, 63, 19, 79]
        this.schedulesBar = new Chart(this.schedulesBarCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: '#a3a0fb'
              }
            ]
          },
          options: {
            legend: {
              display: false
            },
            scales: {
              xAxes: [{
                barPercentage: 0.5,
                barThickness: 30
              }],
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            },
            responsive: true,
            maintainAspectRatio: false
          }
        })
      // }
    // }, () => this.blockUi.stop())

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

  private getCampaignTrees(campaignId: number) {
    this.blockTrees.start()
    this.trees$ = this.campaignService.getCampaignTrees(campaignId).pipe(
      finalize(() => this.blockTrees.stop())
    )
  }
}
