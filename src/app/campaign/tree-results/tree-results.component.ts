import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Campaign, CampaignSchedule } from '../shared/campaign.models';
import { Subject } from 'rxjs';
import { CampaignService } from '../shared/campaign.service';
import { RouteNames } from 'src/app/shared/constants';
import { Chart } from 'chart.js'
import { TreeService } from 'src/app/content/shared/tree.service';
import { Tree } from 'src/app/content/shared/tree.model';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { DateHelpers } from 'src/app/shared/utils';

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
  treeInfo: Tree
  completedCalls = {}
  failedCalls = {}
  hangUpCalls = {}
  scheduleScore = {}
  completedInteractionsBar = {}
  keyMetrics: any
  nodeStats: any
  dateRange = {}
  @ViewChild('completedCallsCanvas') completedCallsCanvas: ElementRef
  @ViewChild('failedCallsCanvas') failedCallsCanvas: ElementRef
  @ViewChild('hangUpCallsCanvas') hangUpCallsCanvas: ElementRef
  @ViewChild('scheduleScoreCanvas') scheduleScoreCanvas: ElementRef
  @ViewChild('completedInteractionsCanvas') completedInteractionsCanvas: ElementRef
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private calendar: NgbCalendar,
    private campaignService: CampaignService,
    private treeService: TreeService) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    this.treeId = +this.activatedRoute.snapshot.paramMap.get('tid')
    if (this.treeId) { this.findTree(this.treeId) }

    this.getCompletedInteractions()
    this.getNodeStats()
    this.getKeyMetrics()
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
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
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

  private findTree(id: number) {
    this.treeService.findTree(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res.success) {
          this.treeInfo = res.data
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

  private getKeyMetrics() {
    this.blockKeyMetrics.start()
    this.treeService.getKeyMetrics({ treeId: this.treeId, campaignId: this.campaignId })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockKeyMetrics.stop()
        if (res.success) {
          this.keyMetrics = res.data
          const bgColor = ['#1a79ff', '#d9d9c3']
          this.makeDoughnut(this.completedCalls, this.completedCallsCanvas, [this.keyMetrics.completed, this.keyMetrics.subscribers - this.keyMetrics.completed], ['Completed', 'Not Completed'], `${this.keyMetrics.completed}`, bgColor, 60)
          this.makeDoughnut(this.failedCalls, this.failedCallsCanvas, [this.keyMetrics.failed, this.keyMetrics.subscribers - this.keyMetrics.failed], ['Failed', 'Not Failed'], `${this.keyMetrics.failed}`, bgColor, 60)
          this.makeDoughnut(this.hangUpCalls, this.hangUpCallsCanvas, [this.keyMetrics.hangup, this.keyMetrics.subscribers - this.keyMetrics.hangup], ['Hanged Up', 'Receive'], `${this.keyMetrics.hangup}`, bgColor, 60)
          this.makeDoughnut(this.scheduleScore, this.scheduleScoreCanvas, [this.keyMetrics.treeScore, this.keyMetrics.totalScore], ['Tree Score', 'Total Score'], `${this.keyMetrics.treeScore}/${this.keyMetrics.totalScore}`, bgColor, -30)
        }
      }, () => this.blockKeyMetrics.stop())
  }

  private getCompletedInteractions() {
    this.blockCompleted.start()
    this.treeService.getCompletedInteractions({ treeId: this.treeId, campaignId: this.campaignId })
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

  private getNodeStats() {
    this.blockNodeStats.start()
    this.treeService.getNodeStats({ treeId: this.treeId, campaignId: this.campaignId })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockNodeStats.stop()
        if (res.success) {
          this.nodeStats = res.data
        }
      }, () => this.blockNodeStats.stop())
  }
}
