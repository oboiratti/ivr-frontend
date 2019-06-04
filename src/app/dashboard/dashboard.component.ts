import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Lookup } from '../shared/common-entities.model';
import { finalize, map } from 'rxjs/operators';
import { SettingsService } from '../app-settings/settings/settings.service';
import { DashboardService } from './dashboard.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Chart } from 'chart.js'

interface SustainabilityStatusQuery {
  areaId: number
  pillarId: number
  topicId: number
  programId: number
  districtId: number
  dateFrom: Date
  dateTo: Date
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  subscriberTypes$: Observable<Lookup[]>
  loadingSubscriberTypes: boolean
  areas$: Observable<Lookup[]>
  loadingAreas: boolean
  pillars$: Observable<Lookup[]>
  loadingPillars: boolean
  topics$: Observable<Lookup[]>
  loadingTopics: boolean
  programs$: Observable<Lookup[]>
  loadingPrograms: boolean
  districts$: Observable<Lookup[]>
  loadingDistricts: boolean
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
  pie = {}
  @ViewChild('doughnutcanvas') doughnutcanvas: ElementRef
  @ViewChild('piecanvas') piecanvas: ElementRef
  startDate: string
  endDate: string
  filter = <SustainabilityStatusQuery>{}

  constructor(private settingsService: SettingsService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.initDates()
    this.loadSubscriberTypes()
    this.getSubscriberSummary()
    this.loadAreas()
    this.loadPillars()
    this.loadPrograms()
    this.loadDistrict()
    this.getSustainabilityStatistics(this.filter)
  }

  ngAfterViewInit() {
    this.landAreaDoughnut()
    this.subscriberCommodityPie()
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

  private subscriberCommodityPie() {
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
        this.pie = new Chart(this.piecanvas.nativeElement, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#7a401b', '#ffc800', '#d81d1e', '#a3a0fb']
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
        let total = 0;
        (res.data as Array<any>).map(elm => {
          data.push(elm.landArea)
          labels.push(elm.commodity + ' ' + elm.landArea + ' Hectares')
          total += elm.landArea
        })

        // const data = [20, 30, 40, 50]
        this.doughnut = new Chart(this.doughnutcanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#7a401b', '#ffc800', '#d81d1e', '#a3a0fb']
              }
            ]
          },
          options: {
            cutoutPercentage: 80,
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              center: {
                text: total,
                color: '#797b85',
                fontStyle: 'Helvetica',
                sidePadding: -30
              }
            }
          }
        })
      }
    }, () => this.blockLand.stop())
  }

  getSustainabilityStatistics(params) {
    this.blockCampaign.start('Loading')
    this.susStatus$ = this.dashboardService.getSustainabilityStatistics(params).pipe(
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

  private loadAreas() {
    this.loadingAreas = true
    this.areas$ = this.settingsService.fetch2('area').pipe(
      finalize(() => this.loadingAreas = false)
    )
  }

  private loadPillars() {
    this.loadingPillars = true
    this.pillars$ = this.settingsService.fetch2('pillar').pipe(
      finalize(() => this.loadingPillars = false)
    )
  }

  loadTopicsInPillar(pillarId: number) {
    this.loadingTopics = true
    this.topics$ = this.dashboardService.fetchTopicsByPillar(pillarId).pipe(
      finalize(() => this.loadingTopics = false)
    )
  }
  private loadPrograms() {
    this.loadingPrograms = true
    this.programs$ = this.settingsService.fetch2('program').pipe(
      finalize(() => this.loadingPrograms = false)
    )
  }
  private loadDistrict() {
    this.loadingDistricts = true
    this.districts$ = this.settingsService.fetch2('district').pipe(
      finalize(() => this.loadingDistricts = false)
    )
  }
}
