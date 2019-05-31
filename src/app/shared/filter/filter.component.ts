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
  @Input() label: any
  @Input() filter: any
  @Input() simple = true
  @Input() dropdownLabel = ''

  constructor() { }

  ngOnInit() {
  }

  doSearch() {
    this.filter[this.label] = this.model
    this.search.emit(this.filter)
  }
}
