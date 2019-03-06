import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subscriber-import',
  templateUrl: './subscriber-import.component.html',
  styleUrls: ['./subscriber-import.component.scss']
})
export class SubscriberImportComponent implements OnInit {

  form: FormGroup
  filename: string
  imports$: Observable<any>

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      file: new FormControl('', Validators.required)
    })
  }

  selectFile(event) {
    const file = event.target.files[0]
    this.filename = file.name
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      this.form.patchValue({file: reader.result})
    }
  }

  uploadFile() {
    console.log(this.form.value);
    
  }
}
