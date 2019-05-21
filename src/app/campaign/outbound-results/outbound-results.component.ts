import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CampaignService } from '../shared/campaign.service';
import { takeUntil } from 'rxjs/operators';
import { Campaign, CampaignScheduleQuery } from '../shared/campaign.models';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Chart } from 'chart.js'

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
  activeDoughnut = {}
  upcomingDoughnut = {}
  hangUpDoughnut = {}
  scoreDoughnut = {}
  summaryPie = {}
  @ViewChild('activeCanvas') activeCanvas: ElementRef
  @ViewChild('upcomingCanvas') upcomingCanvas: ElementRef
  @ViewChild('hangUpCanvas') hangUpCanvas: ElementRef
  @ViewChild('scoreCanvas') scoreCanvas: ElementRef
  @ViewChild('pieCanvas') pieCanvas: ElementRef

  constructor(private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    if (this.campaignId) {
      this.findCampaign(this.campaignId)
    }
  }

  ngAfterViewInit() {
    this.activeSchedulesDoughnut()
    this.upcomingSchedulesDoughnut()
    this.hangUpSchedulesDoughnut()
    this.scoreSchedulesDoughnut()
    this.subscriberSummaryPie()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  private activeSchedulesDoughnut() {
    this.blockUi.start('Loading...')
    // this.campaignService.getLandArea().subscribe(res => {
      this.blockUi.stop()
      // if (res.success) {
        // const data = [];
        // const labels = [];
        // (res.data as Array<any>).map(elm => {
        //   data.push(elm.subscriberCount)
        //   labels.push(elm.commodity + ' ' + elm.subscriberCount)
        // })

        const data = [70, 0]
        const labels = ['Active', 'Inactive']
        this.activeDoughnut = new Chart(this.activeCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#bf9500', '#dcedf6']
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
                text: '16',
                color: '#797b85',
                fontStyle: 'Helvetica',
                sidePadding: 60
              }
            }
          }
        })
      // }
    // }, () => this.blockUi.stop())
  }

  private scoreSchedulesDoughnut() {
    this.blockUi.start('Loading...')
    // this.campaignService.getLandArea().subscribe(res => {
      this.blockUi.stop()
      // if (res.success) {
        // const data = [];
        // const labels = [];
        // (res.data as Array<any>).map(elm => {
        //   data.push(elm.subscriberCount)
        //   labels.push(elm.commodity + ' ' + elm.subscriberCount)
        // })

        const data = [1200, 1800]
        const labels = ['Active', 'Inactive']
        this.scoreDoughnut = new Chart(this.scoreCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#bf9500', '#dcedf6']
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
                text: '1200/3000',
                color: '#797b85',
                fontStyle: 'Helvetica',
                sidePadding: -50
              }
            }
          }
        })
      // }
    // }, () => this.blockUi.stop())
  }

  private upcomingSchedulesDoughnut() {
    this.blockUi.start('Loading...')
    // this.campaignService.getLandArea().subscribe(res => {
      this.blockUi.stop()
      // if (res.success) {
        // const data = [];
        // const labels = [];
        // (res.data as Array<any>).map(elm => {
        //   data.push(elm.subscriberCount)
        //   labels.push(elm.commodity + ' ' + elm.subscriberCount)
        // })

        const data = [4, 6]
        const labels = ['Active', 'Inactive']
        this.upcomingDoughnut = new Chart(this.upcomingCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#bf9500', '#dcedf6']
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
                text: '4',
                color: '#797b85',
                fontStyle: 'Helvetica',
                sidePadding: 75
              }
            }
          }
        })
      // }
    // }, () => this.blockUi.stop())
  }

  private hangUpSchedulesDoughnut() {
    this.blockUi.start('Loading...')
    // this.campaignService.getLandArea().subscribe(res => {
      this.blockUi.stop()
      // if (res.success) {
        // const data = [];
        // const labels = [];
        // (res.data as Array<any>).map(elm => {
        //   data.push(elm.subscriberCount)
        //   labels.push(elm.commodity + ' ' + elm.subscriberCount)
        // })

        const data = [15, 120]
        const labels = ['Active', 'Inactive']
        this.hangUpDoughnut = new Chart(this.hangUpCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#bf9500', '#dcedf6']
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
                text: '15',
                color: '#797b85',
                fontStyle: 'Helvetica',
                sidePadding: 60
              }
            }
          }
        })
      // }
    // }, () => this.blockUi.stop())
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
