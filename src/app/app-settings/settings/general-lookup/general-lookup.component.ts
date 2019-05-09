import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LookUps, SettingsService } from '../settings.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageDialog } from '../../../shared/message_helper';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable, Subject } from 'rxjs';
import { Lookup } from 'src/app/shared/common-entities.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-general-lookup',
  templateUrl: './general-lookup.component.html',
  styleUrls: ['./general-lookup.component.css']
})
export class GeneralLookupComponent implements OnInit, OnDestroy {

  title: string;
  modelName: string;
  model: any;
  showForm: boolean;
  formGroup: FormGroup
  records: any;
  record: any;
  saving: boolean;
  deleting: boolean;
  selectedRecord: any;
  @BlockUI() blockForm: NgBlockUI;
  subscriberTypes$: Observable<Lookup[]>
  regions$: Observable<Lookup[]>
  pillars$: Observable<Lookup[]>
  commodities$: Observable<Lookup[]>
  unsubscribe$ = new Subject<void>()

  constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private settingsService: SettingsService) {
    this.formGroup = this.formBuilder.group({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      subscriberTypeId: new FormControl(''),
      regionId: new FormControl(''),
      pillarId: new FormControl(''),
      commodityId: new FormControl(''),
      notes: new FormControl(''),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    });
  }

  ngOnInit() {
    this.modelName = this.activatedRoute.snapshot.paramMap.get('model');
    this.model = LookUps.models.find(model => model.name === this.modelName)
    this.fetchRecords();
    if (this.modelName === 'commodity') { this.loadSubscriberType() }
    if (this.modelName === 'district') { this.loadRegions() }
    if (this.modelName === 'topic') { this.loadPillars() }
    if (this.modelName === 'program') { this.loadCommodities() }
  }
  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  openForm() {
    this.title = 'New ' + this.model.label;
    this.showForm = true;
  }

  closeForm() {
    this.title = 'New ' + this.model.label;
    this.showForm = false;
    this.formGroup.reset();
  }

  selectRow(record: any) {
    this.formGroup.patchValue(record)
    this.title = 'Edit ' + this.model.label;
    this.showForm = true;
    if (this.modelName === 'commodity') { this.formGroup.patchValue({ subscriberTypeId: record.subscriberType.id }) }
    if (this.modelName === 'district') { this.formGroup.patchValue({ regionId: record.region.id }) }
    if (this.modelName === 'topic') { this.formGroup.patchValue({ pillarId: record.pillar.id }) }
    if (this.modelName === 'program') { this.formGroup.patchValue({ commodityId: record.commodity.id }) }
  }

  save() {
    this.record = this.formGroup.value;
    this.blockForm.start('Saving...');
    this.settingsService.save(this.modelName, this.record)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((res) => {
      this.blockForm.stop();
      if (res.success) {
        this.closeForm()
        this.fetchRecords();
      }
    }, err => {
      this.blockForm.stop();
      console.log('Error -> ' + err);
    });
  }

  remove(id: number) {
    MessageDialog.confirm('Delete Item', 'Are you sure you want to delete this item').then((confirm) => {
      if (confirm.value) {
        this.blockForm.start('Deleting...')
        this.settingsService.destroy(this.modelName, id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.blockForm.stop()
          if (res.success) {
            this.closeForm()
            this.fetchRecords();
          }
        }, err => {
          this.blockForm.stop();
          console.log('Error -> ' + err.message);
        });
      }
    }).catch((err) => { });
  }

  private fetchRecords() {
    this.blockForm.start('Loading')
    this.settingsService.fetch(this.model.name)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((res) => {
      this.blockForm.stop()
      if (res.success) {
        this.records = res.data;
      }
    }, () => this.blockForm.stop());
  }

  private loadSubscriberType() {
    this.subscriberTypes$ = this.settingsService.fetch2('subscribertype')
  }

  private loadRegions() {
    this.regions$ = this.settingsService.fetch2('region')
  }

  private loadPillars() {
    this.pillars$ = this.settingsService.fetch2('pillar')
  }

  private loadCommodities() {
    this.commodities$ = this.settingsService.fetch2('commodity')
  }
}
