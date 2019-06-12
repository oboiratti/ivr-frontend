import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouteNames } from 'src/app/shared/constants';
import { ReportService } from '../report.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';

interface ReportConfig {
  title: string
  query: string
  columns: any
  data: any
  filters?: any
  downloadWordUrl?: string
  downloadExcelUrl?: string
  downloadPdfUrl?: string
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {

  reports: ReportConfig[]
  selectedReport: ReportConfig
  @BlockUI() blockUi: NgBlockUI
  unsubscribe$ = new Subject<void>()
  params: any

  constructor(private reportService: ReportService) { }

  ngOnInit() {
    this.reports = [
      {
        title: 'Call Logs',
        query: 'reports/calllogs/list',
        columns: ['code', 'name', 'phoneNumber', 'gender', 'subscriberType', 'region', 'district', 'location', 'primaryCommodity', 'program', 'totalCalls', 'secondsCompleted', 'totalSurveys'],
        data: [],
        filters: [
          { label: 'Area', type: 'select', model: 'areaId', lookupUrl: 'area/selectget', lookupStore: 'areas' },
          { label: 'Topic', type: 'select', model: 'topicId', lookupUrl: 'topic/selectget', lookupStore: 'topics' },
          { label: 'Pillar', type: 'select', model: 'pillarId', lookupUrl: 'pillar/selectget', lookupStore: 'pillars' },
          { label: 'Region', type: 'select', model: 'regionId', lookupUrl: 'region/selectget', lookupStore: 'regions' },
          { label: 'District', type: 'select', model: 'districtId', lookupUrl: 'district/selectget', lookupStore: 'districts' },
          { label: 'Location', type: 'text', model: 'location' },
          { label: 'Campaign', type: 'select', model: 'campaignId', lookupUrl: 'campaign/selectget', lookupStore: 'campaigns' },
          { label: 'Commodity', type: 'select', model: 'commodityId', lookupUrl: 'commodity/selectget', lookupStore: 'commodities' },
          { label: 'Program', type: 'select', model: 'programId', lookupUrl: 'program/selectget', lookupStore: 'programs' },
          { label: 'Type', type: 'select', model: 'typeId', lookupUrl: 'subscribertype/selectget', lookupStore: 'subscriberTypes' },
          { label: 'Call Date', type: 'date', model: 'callDate' }
        ],
        downloadWordUrl: 'reports/calllogs/word',
        downloadExcelUrl: 'reports/calllogs/excel',
        downloadPdfUrl: 'reports/calllogs/pdf'
      },
      {
        title: 'Subscriber List',
        query: 'reports/subscriberslist/list',
        columns: ['code', 'name', 'phoneNumber', 'gender', 'subscriberType', 'region', 'district', 'location', 'primaryCommodity', 'program', 'educationalLevel', 'landSize'],
        data: [],
        filters: [
          { label: 'Region', type: 'select', model: 'regionId', lookupUrl: 'region/selectget', lookupStore: 'regions' },
          { label: 'District', type: 'select', model: 'districtId', lookupUrl: 'district/selectget', lookupStore: 'districts' },
          { label: 'Location', type: 'text', model: 'location' },
          { label: 'Commodity', type: 'select', model: 'commodityId', lookupUrl: 'commodity/selectget', lookupStore: 'commodities' },
          { label: 'Program', type: 'select', model: 'programId', lookupUrl: 'program/selectget', lookupStore: 'programs' },
          { label: 'Type', type: 'select', model: 'typeId', lookupUrl: 'subscribertype/selectget', lookupStore: 'subscriberTypes' }
        ],
        downloadWordUrl: 'reports/subscriberslist/word',
        downloadExcelUrl: 'reports/subscriberslist/excel',
        downloadPdfUrl: 'reports/subscriberslist/pdf'
      }
    ]
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  getReportData(params: any) {
    this.blockUi.start('Loading...')
    this.params = params
    this.reportService.getReport(this.selectedReport.query, params)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.blockUi.stop())
      )
      .subscribe(res => {
        if (res.success) {
          this.selectedReport.data = res.data
        }
      })
  }

  downloadWord() {
    this.blockUi.start('Downloading...')
    this.reportService.downloadFile(this.selectedReport.downloadWordUrl, this.params)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.blockUi.stop())
      )
      .subscribe((res: any) => {
        if (res.success) {
          const blob = this.dataURItoBlob(res.data)
          saveAs(blob, `${this.selectedReport.title}.docx`)
        }
      })
  }

  downloadExcel() {
    this.blockUi.start('Downloading...')
    this.reportService.downloadFile(this.selectedReport.downloadExcelUrl, this.params)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.blockUi.stop())
      )
      .subscribe((res: any) => {
        if (res.success) {
          const blob = this.dataURItoBlob(res.data)
          saveAs(blob, `${this.selectedReport.title}.xlsx`)
        }
      })
  }

  downloadPdf() {
    this.blockUi.start('Downloading...')
    this.reportService.downloadFile(this.selectedReport.downloadPdfUrl, this.params)
      .pipe(
        takeUntil(this.unsubscribe$),
        finalize(() => this.blockUi.stop())
      )
      .subscribe((res: any) => {
        if (res.success) {
          const blob = this.dataURItoBlob(res.data)
          saveAs(blob, `${this.selectedReport.title}.pdf`)
        }
      })
  }

  private dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}
