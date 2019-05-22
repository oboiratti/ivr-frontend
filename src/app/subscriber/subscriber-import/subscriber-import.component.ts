import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { SubscriberService } from '../shared/subscriber.service';
import { SubscriberUploadModel } from '../shared/subscriber.model';
import { Observable, Subscription, Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-subscriber-import',
  templateUrl: './subscriber-import.component.html',
  styleUrls: ['./subscriber-import.component.scss']
})
export class SubscriberImportComponent implements OnInit, OnDestroy {
  tempFile: any;
  @BlockUI() blockUi: NgBlockUI;
  form: FormGroup
  filename: string
  imports$: Observable<any>
  rows: any[]
  data: any[]
  unsubscribe$ = new Subject<void>()

  constructor(private fb: FormBuilder, private subscriberService: SubscriberService) { }

  ngOnInit() {
    this.form = this.fb.group({
      file: new FormControl('', Validators.required)
    })
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  /*selectFile(event) {
    const file = event.target.files[0]
    this.filename = file.name
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      this.form.patchValue({file: reader.result})
    }
  }*/
  selectFile(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) { throw new Error('Cannot use multiple files'); }
    this.filename = target.files[0].name
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const rows = <any>(XLSX.utils.sheet_to_csv(ws));
      const lines = rows.split('\n');
      if (lines.length <= 2) {
        MessageDialog.error('The upload file should not be empty');
        return;
      }
      const result = [];
      const headers = lines[0].split(',');
      for (let i = 1; i < (lines.length - 1); i++) {
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
      }
      this.data = result.map((rec: any) => {
        return this.refactorRecord(rec)
      });
    };
    reader.readAsBinaryString(target.files[0]);
  }

  private refactorRecord(data: any): any {
    const rec = <any>{
      code: data.CODE,
      name: data.NAME,
      dateOfBirth: new Date(data.DATE_OF_BIRTH),
      gender: data.GENDER,
      phoneNumber: data.PHONE_NUMBER,
      location: data.LOCATION,
      startDate: new Date(data.START_DATE),
      voice: data.VOICE,
      sms: data.SMS,
      landSize: data.LAND_SIZE,
      language: data.LANGUAGE,
      district: data.DISTRICT,
      program: data.PROGRAM,
      educationalLevel: data.EDUCATIONAL_LEVEL,
      type: data.SUBSCRIBER_TYPE,
      group1: data.SUBSCRIBER_GROUP_1,
      group2: data.SUBSCRIBER_GROUP_2,
      group3: data.SUBSCRIBER_GROUP_3,
      group4: data.SUBSCRIBER_GROUP_4,
      group5: data.SUBSCRIBER_GROUP_5,
      primaryCommodity: data.SUBSCRIBER_PRIMARY_COMMODITY,
      commodity2: data.SUBSCRIBER_COMMODITY_2,
      commodity3: data.SUBSCRIBER_COMMODITY_3,
      commodity4: data.SUBSCRIBER_COMMODITY_4,
      commodity5: data.SUBSCRIBER_COMMODITY_5,
    }
    return rec;
  }

  downloadTemplate() {
    this.blockUi.start('Downloading...');
    this.subscriberService.downloadTemplate()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        this.blockUi.stop();
        if (res.success) {
          const data = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + res.data;
          window.open(data, '_blank', '')
        }
      }, err => {
        this.blockUi.stop();
        console.log('Error -> ' + err.message);
      });
  }

  saveUploadData() {
    this.blockUi.start('Saving...');
    this.subscriberService.saveUploadData(this.data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        this.blockUi.stop();
        if (res.success) {
          this.data = null
        }
      }, err => {
        this.blockUi.stop();
        console.log('Error -> ' + err.message);
      });
  }
}
