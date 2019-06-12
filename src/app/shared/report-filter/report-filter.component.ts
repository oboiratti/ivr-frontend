import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReportFilterService } from './report-filter.service';

@Component({
  selector: 'app-report-filter',
  templateUrl: './report-filter.component.html',
  styleUrls: ['./report-filter.component.scss']
})
export class ReportFilterComponent implements OnInit {

  model = { size: 50 }
  @Input() filters: any = []
  @Output() generate = new EventEmitter<any>()
  lookups: any = {}

  constructor(private reportFilterService: ReportFilterService) { }

  ngOnInit() {
    this.loadLookups()
  }

  generateReport() {
    this.generate.emit(this.model)
  }

  private loadLookups() {
    (this.filters as [])
      .filter((item: any) => item.type === 'select')
      .map((item: any) => {
        this.reportFilterService.fetch(item.lookupUrl).subscribe(res => {
          if (res.success) {
            this.lookups[item.lookupStore] = res.data
          }
        })
      })
  }
}
