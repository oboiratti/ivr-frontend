import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LookUps, SettingsService } from '../settings.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageDialog } from '../../shared/message_helper';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-general-lookup',
  templateUrl: './general-lookup.component.html',
  styleUrls: ['./general-lookup.component.css']
})
export class GeneralLookupComponent implements OnInit {

  title: string;
  modelName: string;
  model: any;
  showForm: boolean;
  formGroup: FormGroup
  records: any;
  record: any;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  selectedRecord: any;
  @BlockUI() blockForm: NgBlockUI;

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private settingsService: SettingsService) {
    this.formGroup = this.formBuilder.group({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      value: new FormControl(0),
      description: new FormControl('')
    });
  }

  ngOnInit() {
    this.modelName = this.activatedRoute.snapshot.paramMap.get('model');
    this.model = LookUps.models.find(model => model.name === this.modelName)
    this.fetchRecords();
  }

  openForm() {
    this.title = "New " + this.model.label;
    this.showForm = true;
  }

  closeForm() {
    this.title = "New " + this.model.label;
    this.showForm = false;
    this.formGroup.reset();
  }

  selectRow(record: any) {
    this.formGroup.patchValue(record)
    this.title = "Edit " + this.model.label;
    this.showForm = true;
  }

  save() {
    this.record = this.formGroup.value;
    this.blockForm.start("Saving...");
    this.settingsService.save(this.modelName, this.record).subscribe((res) => {
      this.blockForm.stop();
      if (res.success) {
        this.closeForm()
        this.fetchRecords();
      }
    }, err => {
      this.blockForm.stop();
      console.log("Error -> " + err);
    });
  }

  remove(id: number) {
    MessageDialog.confirm("Delete Item", "Are you sure you want to delete this item").then((confirm) => {
      if (confirm.value) {
        this.blockForm.start("Deleting...")
        this.settingsService.destroy(this.modelName, id).subscribe((res) => {
          this.blockForm.stop()
          if (res.success) {
            this.closeForm()
            this.fetchRecords();
          }
        }, err => {
          this.blockForm.stop();
          console.log("Error -> " + err.message);
        });
      }
    }).catch((err) => {});
  }

  private fetchRecords() {
    this.loading = true;
    this.settingsService.fetch(this.model.name).subscribe((res) => {
      this.loading = false;
      if (res.success) {
        this.records = res.data;
      }
    });
  }
}
