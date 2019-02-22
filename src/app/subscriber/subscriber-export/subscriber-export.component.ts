import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-subscriber-export',
  templateUrl: './subscriber-export.component.html',
  styleUrls: ['./subscriber-export.component.scss']
})
export class SubscriberExportComponent implements OnInit {

  form: FormGroup

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.setupForm()
  }

  get groupType() { return this.form.get('groupType') }

  private setupForm() {
    this.form = this.fb.group({
      groupType: new FormControl('', Validators.required),
      dateTimeFormat: new FormControl(''),
      groupId: new FormControl('')
    })
  }
}
