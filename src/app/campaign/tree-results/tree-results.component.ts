import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Campaign, CampaignSchedule, TreeResultsQuery } from '../shared/campaign.models';
import { Subject, Observable } from 'rxjs';
import { CampaignService } from '../shared/campaign.service';
import { RouteNames } from 'src/app/shared/constants';
import { Chart } from 'chart.js'
import { TreeService } from 'src/app/content/shared/tree.service';
import { Tree } from 'src/app/content/shared/tree.model';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { DateHelpers } from 'src/app/shared/utils';
import { District, Lookup } from 'src/app/shared/common-entities.model';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';

@Component({
  selector: 'app-tree-results',
  templateUrl: './tree-results.component.html',
  styleUrls: ['./tree-results.component.scss']
})
export class TreeResultsComponent implements OnInit, OnDestroy, AfterViewInit {

  @BlockUI('keyMetrics') blockKeyMetrics: NgBlockUI
  @BlockUI('completed') blockCompleted: NgBlockUI
  @BlockUI('nodeStats') blockNodeStats: NgBlockUI
  campaignId: number
  treeId: number
  unsubscribe$ = new Subject<void>()
  treeInfo$: Observable<Tree>
  completedCalls: Chart
  failedCalls: Chart
  hangUpCalls: Chart
  scheduleScore: Chart
  completedInteractionsBar = {}
  keyMetrics: any
  nodeStats: any
  dateRange = ''
  @ViewChild('completedCallsCanvas') completedCallsCanvas: ElementRef
  @ViewChild('failedCallsCanvas') failedCallsCanvas: ElementRef
  @ViewChild('hangUpCallsCanvas') hangUpCallsCanvas: ElementRef
  @ViewChild('scheduleScoreCanvas') scheduleScoreCanvas: ElementRef
  @ViewChild('completedInteractionsCanvas') completedInteractionsCanvas: ElementRef
  @ViewChild('d') dpc: any
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  filter: TreeResultsQuery
  districts: District
  groups: Lookup

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private calendar: NgbCalendar,
    private treeService: TreeService,
    private settingsService: SettingsService) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    this.treeId = +this.activatedRoute.snapshot.paramMap.get('tid')
    if (this.treeId) { this.findTree(this.treeId, this.campaignId) }
    this.filter = <TreeResultsQuery>{campaignId: this.campaignId, treeId: this.treeId}
    this.getCompletedInteractions(this.filter)
    this.getNodeStats(this.filter)
    this.getKeyMetrics(this.filter)
    this.getTreeResultsFilterList({ treeId: this.treeId, campaignId: this.campaignId })
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  gotoCampaignResults() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outboundResults}/${this.campaignId}`)
  }

  secondsToTime(seconds: number) {
    return DateHelpers.secondsToTime(seconds)
  }

  onDateSelection(date: NgbDate) {
    let dateFrom = null
    let dateTo = null
    this.dateRange = ''
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      dateFrom = DateHelpers.dateFromObj(this.fromDate).toISOString().substring(0, 10)
      this.dateRange = dateFrom
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
      dateFrom = DateHelpers.dateFromObj(this.fromDate).toISOString().substring(0, 10)
      dateTo = DateHelpers.dateFromObj(this.toDate).toISOString().substring(0, 10)
      this.dateRange = `${dateFrom} to ${dateTo}`
      this.getKeyMetrics(this.filter)
      this.dpc.close()
    } else {
      this.toDate = null;
      this.fromDate = date;
      dateFrom = DateHelpers.dateFromObj(this.fromDate).toISOString().substring(0, 10)
      dateTo = null
      this.dateRange = dateFrom
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  performSearch(filter: TreeResultsQuery) {
    this.getCompletedInteractions(filter)
    this.getNodeStats(filter)
    this.getKeyMetrics(filter)
  }

  private findTree(treeId: number, campaignId: number) {
    this.treeInfo$ = this.treeService.findSlimTree(treeId, campaignId)
  }

  private makeDoughnut(obj: any, canvas: ElementRef, data: any, labels: any, text?: string, backgroundColor?: any, sidePadding?: number) {
    if (obj instanceof Chart) { obj.destroy() }
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

  private completedCallsDoughnut(data, labels, text) {
    if (this.completedCalls instanceof Chart) { this.completedCalls.destroy() }
    this.completedCalls = new Chart(this.completedCallsCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#1a79ff', '#d9d9c3']
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
            text: text,
            color: '#797b85',
            fontStyle: 'Helvetica',
            sidePadding: 60
          }
        }
      }
    })
  }

  private failedCallsDoughnut(data, labels, text) {
    if (this.failedCalls instanceof Chart) { this.failedCalls.destroy() }
    this.failedCalls = new Chart(this.failedCallsCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#1a79ff', '#d9d9c3']
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
            text: text,
            color: '#797b85',
            fontStyle: 'Helvetica',
            sidePadding: 60
          }
        }
      }
    })
  }

  private hangupCallsDoughnut(data, labels, text) {
    if (this.hangUpCalls instanceof Chart) { this.hangUpCalls.destroy() }
    this.hangUpCalls = new Chart(this.hangUpCallsCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#1a79ff', '#d9d9c3']
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
            text: text,
            color: '#797b85',
            fontStyle: 'Helvetica',
            sidePadding: 60
          }
        }
      }
    })
  }

  private scheduleScoreDoughnut(data, labels, text) {
    if (this.scheduleScore instanceof Chart) { this.scheduleScore.destroy() }
    this.scheduleScore = new Chart(this.scheduleScoreCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#1a79ff', '#d9d9c3']
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
            text: text,
            color: '#797b85',
            fontStyle: 'Helvetica',
            sidePadding: -30
          }
        }
      }
    })
  }

  private getKeyMetrics(filter: TreeResultsQuery) {
    this.blockKeyMetrics.start()
    this.treeService.getKeyMetrics(filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockKeyMetrics.stop()
        if (res.success) {
          this.keyMetrics = res.data
          const bgColor = ['#1a79ff', '#d9d9c3']
          this.completedCallsDoughnut([this.keyMetrics.completed, this.keyMetrics.subscribers - this.keyMetrics.completed], ['Completed', 'Not Completed'], `${this.keyMetrics.completed}`)
          this.failedCallsDoughnut([this.keyMetrics.failed, this.keyMetrics.subscribers - this.keyMetrics.failed], ['Failed', 'Not Failed'], `${this.keyMetrics.failed}`)
          this.hangupCallsDoughnut([this.keyMetrics.hangup, this.keyMetrics.subscribers - this.keyMetrics.hangup], ['Hanged Up', 'Receive'], `${this.keyMetrics.hangup}`)
          this.scheduleScoreDoughnut([this.keyMetrics.treeScore, this.keyMetrics.totalScore], ['Tree Score', 'Total Score'], `${this.keyMetrics.treeScore}/${this.keyMetrics.totalScore}`)
          // this.makeDoughnut(this.completedCalls, this.completedCallsCanvas, [this.keyMetrics.completed, this.keyMetrics.subscribers - this.keyMetrics.completed], ['Completed', 'Not Completed'], `${this.keyMetrics.completed}`, bgColor, 60)
          // this.makeDoughnut(this.failedCalls, this.failedCallsCanvas, [this.keyMetrics.failed, this.keyMetrics.subscribers - this.keyMetrics.failed], ['Failed', 'Not Failed'], `${this.keyMetrics.failed}`, bgColor, 60)
          // this.makeDoughnut(this.hangUpCalls, this.hangUpCallsCanvas, [this.keyMetrics.hangup, this.keyMetrics.subscribers - this.keyMetrics.hangup], ['Hanged Up', 'Receive'], `${this.keyMetrics.hangup}`, bgColor, 60)
          // this.makeDoughnut(this.scheduleScore, this.scheduleScoreCanvas, [this.keyMetrics.treeScore, this.keyMetrics.totalScore], ['Tree Score', 'Total Score'], `${this.keyMetrics.treeScore}/${this.keyMetrics.totalScore}`, bgColor, -30)


        }
      }, () => this.blockKeyMetrics.stop())
  }

  private getCompletedInteractions(filter: TreeResultsQuery) {
    this.blockCompleted.start()
    this.treeService.getCompletedInteractions(filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockCompleted.stop()
        if (res.success) {
          const totalScore = [];
          const nodeScore = [];
          const labels = [];
          (res.data as Array<any>).map(obj => {
            totalScore.push(obj.totalScore)
            nodeScore.push(obj.nodeScore)
            labels.push(obj.title)
          })
          this.completedInteractionsBar = new Chart(this.completedInteractionsCanvas.nativeElement, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [
                {
                  data: totalScore,
                  backgroundColor: '#00b300',
                  label: 'Total Score'
                },
                {
                  data: nodeScore,
                  backgroundColor: '#cc0000',
                  label: 'Node Score'
                }
              ]
            },
            options: {
              legend: {
                display: true
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
        }
      }, () => this.blockCompleted.stop())
  }

  private getNodeStats(filter: TreeResultsQuery) {
    this.blockNodeStats.start()
    this.treeService.getNodeStats(filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockNodeStats.stop()
        if (res.success) {
          this.nodeStats = res.data
        }
      }, () => this.blockNodeStats.stop())
  }

  private getTreeResultsFilterList(params) {
    this.treeService.getTreeResultsFilterList(params).subscribe(res => {
      if (res.success) {
        this.groups = res.data.groups
        this.districts = res.data.districts
      }
    })
  }
}
