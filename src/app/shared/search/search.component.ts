import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Input() filters: any = []
  @Output() search = new EventEmitter<string>()
  form: FormGroup
  list = []
  isDuplicate: boolean
  lookups: any = {}

  operations = [
    { label: "Like", value: ":" },
    { label: "Equals", value: "=" },
    { label: "Greater Than", value: ">" },
    { label: "Less Than", value: "<" }
  ]

  constructor(private fb: FormBuilder, private searchService: SearchService) { }

  ngOnInit() {
    this.setUpForm()
    this.paramValueChangeListener()
    this.loadLookups()
  }

  addToList() {
    this.markAsDirty()
    if (this.form.invalid) return

    this.isDuplicate = false
    const found = this.list.find(item => {
      return item.param === this.form.value.param
    })

    if (found) {
      this.isDuplicate = true
      return
    }

    this.list.push(this.form.value)
    this.form.patchValue({param: this.filters[0], value: ''})
    this.form.markAsPristine()
  }

  remove(index: number) {
    this.list.splice(index, 1)
    this.isDuplicate = false
  }

  submit() {
    if (this.list.length <= 0) {
      this.search.emit()
      return
    }
    
    let str = ""
    this.list.map(item => {
      str += `${item.param.value}${item.operation.value}${item.value},`
    })
    this.search.emit(str.substring(0, str.length - 1))
  }

  get param() {return this.form.get('param')}
  get value() {return this.form.get('value')}

  private setUpForm() {
    this.form = this.fb.group({
      param: new FormControl(this.filters[0], Validators.required),
      value: new FormControl('', Validators.required),
      operation: new FormControl(this.operations[0], Validators.required)
    })
  }

  private markAsDirty() {
    Object.keys(this.form.controls).forEach((field) => {
      this.form.controls[field].markAsDirty();
    })
  }

  private paramValueChangeListener() {
    this.param.valueChanges.subscribe(value => {
      this.isDuplicate = false
    })
  }

  loadLookups() {
    this.filters.map(filter => {
      if (filter.type === "select") {
        this.searchService.fetch(filter.lookupName).subscribe(res => {
          if (res.success) this.lookups[filter.lookupStore] = res.data
        })
      }
    })
  }
}
