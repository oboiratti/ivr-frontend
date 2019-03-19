import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Output() search = new EventEmitter<any>()
  @Input() placeholder: string
  @Input() model: any
  @Input() name: any
  @Input() filter: any

  constructor() { }

  ngOnInit() {
  }

  doSearch() {
    this.filter[this.name] = this.model
    this.search.emit(this.filter)
  }
}
