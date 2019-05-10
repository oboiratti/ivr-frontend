import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Lookup } from '../shared/common-entities.model';
import { finalize, map } from 'rxjs/operators';
import { SettingsService } from '../app-settings/settings/settings.service';
import { DashboardService } from './dashboard.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Chart } from 'chart.js'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  subscriberTypes$: Observable<Lookup[]>
  loadingSubscriberTypes: boolean
  subscriberTypeId: number
  subscriberTypeSummary$: Observable<any>
  subscriberSummary$: Observable<any>
  susStatus$: Observable<any>
  @BlockUI('type') blockSubscriberType: NgBlockUI
  @BlockUI('subs') blockSubscriberSummary: NgBlockUI
  @BlockUI('commodity') blockCommodity: NgBlockUI
  @BlockUI('land') blockLand: NgBlockUI
  @BlockUI('campaign') blockCampaign: NgBlockUI
  doughnut = {}
  @ViewChild('doughnutcanvas') doughnutcanvas: ElementRef
  @ViewChild('barcanvas') barcanvas: ElementRef
  startDate: string
  endDate: string

  constructor(private settingsService: SettingsService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.initDates()
    this.loadSubscriberTypes()
    this.getSubscriberSummary()
    this.getCampaignSummary(this.startDate, this.endDate)
  }

  ngAfterViewInit() {
    this.landAreaDoughnut()
    this.subscriberCommodityBar()
  }

  subscriberTypeOnChange() {
    this.blockSubscriberType.start('Loading...')
    this.subscriberTypeSummary$ = this.dashboardService.getBySubscriberType(this.subscriberTypeId).pipe(
      finalize(() => this.blockSubscriberType.stop())
    )
  }

  setProgressColor(percentage: number) {
    if (percentage >= 70 && percentage <= 100) {
      return 'bg-success'
    } else if (percentage >= 50 && percentage < 70) {
      return 'bg-warning'
    } else if (percentage >= 25 && percentage < 50) {
      return 'bg-pink'
    } else { return 'bg-danger' }
  }

  private loadSubscriberTypes() {
    this.loadingSubscriberTypes = true
    this.subscriberTypes$ = this.settingsService.fetch2('subscribertype').pipe(
      map(rec => {
        this.subscriberTypeId = rec[0].id
        this.subscriberTypeOnChange()
        return rec
      }),
      finalize(() => this.loadingSubscriberTypes = false)
    )
  }

  private getSubscriberSummary() {
    this.blockSubscriberSummary.start('Loading')
    this.subscriberSummary$ = this.dashboardService.getSubscriberSummary().pipe(
      finalize(() => this.blockSubscriberSummary.stop())
    )
  }

  private subscriberCommodityBar() {
    this.blockCommodity.start('Loading...')
    this.dashboardService.getCommoditySummary().subscribe(res => {
      this.blockCommodity.stop()
      if (res.success) {
        const data = [];
        const labels = [];
        (res.data as Array<any>).map(elm => {
          data.push(elm.subscriberCount)
          labels.push(elm.commodity)
        })

        // const data = [20, 30, 40, 50]
        this.doughnut = new Chart(this.barcanvas.nativeElement, {
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
              }],
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        })
      }
    }, () => this.blockCommodity.stop())

  }

  private landAreaDoughnut() {
    this.blockLand.start('Loading...')
    this.dashboardService.getLandArea().subscribe(res => {
      this.blockLand.stop()
      if (res.success) {
        const data = [];
        const labels = [];
        (res.data as Array<any>).map(elm => {
          data.push(elm.subscriberCount)
          labels.push(elm.commodity)
        })

        // const data = [20, 30, 40, 50]
        this.doughnut = new Chart(this.doughnutcanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#7a401b', '#d81d1e', '#ffc800', '#a3a0fb']
              }
            ]
          },
          options: {
            cutoutPercentage: 60,
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10
              }
            },
            responsive: true,
            maintainAspectRatio: false
          },
          centerText: {
            display: true,
            text: 20
          }
        })
      }
    }, () => this.blockLand.stop())
  }

  private getCampaignSummary(startDate: string, endDate: string) {
    this.blockCampaign.start('Loading')
    this.susStatus$ = this.dashboardService.getCampaignSummary(startDate, endDate).pipe(
      finalize(() => this.blockCampaign.stop())
    )
  }

  private increaseMonth(date: Date, increament: number) {
    date.setMonth(date.getMonth() + increament)
    return date
  }

  private initDates() {
    this.startDate = new Date().toISOString().substring(0, 10)
    this.endDate = this.increaseMonth(new Date(), 1).toISOString().substring(0, 10)
  }
}
