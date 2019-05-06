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
  @BlockUI('type') blockSubscriberType: NgBlockUI
  @BlockUI('subs') blockSubscriberSummary: NgBlockUI
  @BlockUI('commodity') blockCommodity: NgBlockUI
  @BlockUI('land') blockLand: NgBlockUI
  doughnut = {}
  @ViewChild('doughnutcanvas') doughnutcanvas: ElementRef
  @ViewChild('barcanvas') barcanvas: ElementRef

  constructor(private settingsService: SettingsService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadSubscriberTypes()
    this.getSubscriberSummary()
  }

  ngAfterViewInit() {
    this.subscriberCommodityDoughnut()
    this.subscriberCommodityBar()
  }

  subscriberTypeOnChange() {
    this.blockSubscriberType.start('Loading...')
    this.subscriberTypeSummary$ = this.dashboardService.getBySubscriberType(this.subscriberTypeId).pipe(
      finalize(() => this.blockSubscriberType.stop())
    )
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

  private subscriberCommodityDoughnut() {
    this.blockLand.start('Loading...')
    this.dashboardService.getCommoditySummary().subscribe(res => {
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
          }
        })
      }
    }, () => this.blockLand.stop())

  }
}
