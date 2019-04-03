import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription, Subject } from 'rxjs';
import { Lookup } from 'src/app/shared/common-entities.model';
import { SubscriberService } from '../shared/subscriber.service';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Subscriber, SubscriberGroup } from '../shared/subscriber.model';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';
import { shareReplay, takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-subscriber-form',
  templateUrl: './subscriber-form.component.html',
  styleUrls: ['./subscriber-form.component.scss']
})
export class SubscriberFormComponent implements OnInit, OnDestroy {

  form: FormGroup
  languages$: Observable<Lookup[]>
  districts$: Observable<Lookup[]>
  regions$: Observable<Lookup[]>
  educationalLevels$: Observable<Lookup[]>
  subscriberTypes$: Observable<Lookup[]>
  commodities$: Observable<Lookup[]>
  groups$: Observable<SubscriberGroup[]>
  unsubscribe$ = new Subject<void>();
  @BlockUI() blockUi: NgBlockUI

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.setupForm()
    this.loadLanguages()
    this.loadRegions()
    this.loadGroups()
    this.loadEducationalLevels()
    this.loadSubscriberTypes()
    this.regionValueChangeListener()
    this.districtValueChangeListener()
    this.subscriberTypeValueChangeListener()
    this.otherCommoditiesChangeListener()
    this.primaryCommodityChangeListener()
    const id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (id) { this.findSubscriber(id) }
    this.disableControls()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  save(formData: any) {
    const params = formData
    if (params.subscriberGroups) {
      params.subscriberGroups = params.subscriberGroups.map(elm => {
        return { groupId: elm }
      })
    }

    if (params.otherCommodities) {
      params.subscriberCommodities = params.otherCommodities.map(elm => {
        return { commodityId: elm.id, isPrimaryCommodity: false }
      })
    }

    params.subscriberCommodities.push({ commodityId: params.primaryCommodity, isPrimaryCommodity: true })

    this.blockUi.start('Saving...')
    this.subscriberService.saveSubscriber(formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockUi.stop()
        if (res.success) { this.closeForm() }
      }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberList}`)
  }

  removeFromGroup(group) {
    MessageDialog.confirm('Remove Group', `Are you sure you want to remove this subscriber from '${group.name}'?`).then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Removing Group...')
        this.subscriberService.removeSubscriberFromGroup(this.id.value, group.id)
          .pipe(
            takeUntil(this.unsubscribe$),
            finalize(() => this.blockUi.stop())
          )
          .subscribe(res => {
            if (res.success) {
              this.blockUi.stop()
              const groups = (this.subscriberGroups.value as []).filter((val: any) => val !== group.id)
              this.subscriberGroups.patchValue(groups)
            }
          })

      }
    })
  }

  removeCommodity(commodity) {
    MessageDialog.confirm('Remove Commodity', `Are you sure you want to remove '${commodity.name}' from other commodities?`).then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Removing Commodity...')
        this.subscriberService.removeSubscriberCommodity(this.id.value, commodity.id)
          .pipe(
            takeUntil(this.unsubscribe$),
            finalize(() => this.blockUi.stop())
          )
          .subscribe(res => {
            if (res.success) {
              this.blockUi.stop()
              const commodities = (this.otherCommodities.value as []).filter((val: any) => val !== commodity.id)
              this.subscriberGroups.patchValue(commodities)
            }
          })

      }
    })
  }

  get id() { return this.form.get('id') }
  get phoneNumber() { return this.form.get('phoneNumber') }
  get name() { return this.form.get('name') }
  get languageId() { return this.form.get('languageId') }
  get gender() { return this.form.get('gender') }
  get startDate() { return this.form.get('startDate') }
  get districtId() { return this.form.get('districtId') }
  get location() { return this.form.get('location') }
  get voice() { return this.form.get('voice') }
  get sms() { return this.form.get('sms') }
  get comments() { return this.form.get('comments') }
  get subscriberGroups() { return this.form.get('subscriberGroups') }
  get regionId() { return this.form.get('regionId') }
  get educationLevelId() { return this.form.get('educationLevelId') }
  get dateOfBirth() { return this.form.get('dateOfBirth') }
  get subscriberTypeId() { return this.form.get('subscriberTypeId') }
  get primaryCommodity() { return this.form.get('primaryCommodity') }
  get otherCommodities() { return this.form.get('otherCommodities') }
  get landSize() { return this.form.get('landSize') }

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      phoneNumber: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0]+[0-9]{9}$')
      ])),
      name: new FormControl('', Validators.required),
      languageId: new FormControl('', Validators.required),
      gender: new FormControl('Male', Validators.required),
      startDate: new FormControl('', Validators.required),
      regionId: new FormControl(null, Validators.required),
      districtId: new FormControl(null, Validators.required),
      location: new FormControl('', Validators.required),
      voice: new FormControl(true),
      sms: new FormControl(''),
      comments: new FormControl(''),
      subscriberGroups: new FormControl(null),
      educationLevelId: new FormControl(null, Validators.required),
      dateOfBirth: new FormControl(null),
      subscriberTypeId: new FormControl(null, Validators.required),
      primaryCommodity: new FormControl(null, Validators.required),
      otherCommodities: new FormControl([]),
      landSize: new FormControl(null),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    })
  }

  private loadLanguages() {
    this.languages$ = this.settingsService.fetch2('language')
  }

  private loadDistrictsInRegion(regionId: number) {
    this.districts$ = this.subscriberService.fetchDistrictsByRegion(regionId)
  }

  private loadRegions() {
    this.regions$ = this.settingsService.fetch2('region')
  }

  private loadEducationalLevels() {
    this.educationalLevels$ = this.settingsService.fetch2('educationallevel')
  }

  private loadSubscriberTypes() {
    this.subscriberTypes$ = this.settingsService.fetch2('subscribertype')
  }

  private loadSubscriberTypeCommodities(subscriberTypeId: number) {
    this.commodities$ = this.subscriberService.fetchCommoditiesBySubscriberType(subscriberTypeId).pipe(shareReplay(1))
  }

  private loadGroups() {
    this.groups$ = this.subscriberService.fetchSubscriberGroups()
  }

  private findSubscriber(id: number) {
    this.blockUi.start('Loading...')
    this.subscriberService.findSubscriber(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.blockUi.stop()
          this.form.patchValue(data)
          this.form.patchValue({
            startDate: new Date(data.startDate).toISOString().substring(0, 10),
            dateOfBirth: new Date(data.dateOfBirth).toISOString().substring(0, 10),
            languageId: data.language.id,
            regionId: data.region.id,
            districtId: data.district.id,
            educationLevelId: data.educationalLevel.educationLevelId,
            subscriberTypeId: data.subscriberType.subscriberTypeId,
            subscriberGroups: data.subscriberGroups.map(grp => grp.groupId),
            primaryCommodity: data.primaryComodity.commodityId,
            otherCommodities: data.otherCommodities ? data.otherCommodities
              .map(elm => {
                return { id: elm.commodityId, name: elm.commodity }
              }) : null
          })
      }, () => this.blockUi.stop())
  }

  private disableControls() {
    if (!this.regionId.value) { this.districtId.disable() }
    if (!this.districtId.value) { this.location.disable() }
    if (!this.subscriberTypeId.value) {
      this.primaryCommodity.disable()
      this.otherCommodities.disable()
    }
  }

  private regionValueChangeListener() {
    this.regionId.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.loadDistrictsInRegion(value)
        this.districtId.enable()
      })
  }

  private districtValueChangeListener() {
    this.districtId.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        if (value) { this.location.enable() }
      })
  }

  private subscriberTypeValueChangeListener() {
    this.subscriberTypeId.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.loadSubscriberTypeCommodities(value)
        this.primaryCommodity.enable()
        this.otherCommodities.enable()
      })
  }

  private otherCommoditiesChangeListener() {
    this.otherCommodities.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: []) => {
        if (value && this.primaryCommodity.value) {
          const index: any = value.findIndex((elm: any) => elm.id === this.primaryCommodity.value)
          if (index >= 0) {
            const obj = this.otherCommodities.value[index]
            MessageDialog.error(`${obj.name} has already been added as a primary commodity`)
            this.otherCommodities.value.splice(index, 1)
            this.otherCommodities.patchValue(this.otherCommodities.value, { emitEvent: false })
          }
        }
      })
  }

  private primaryCommodityChangeListener() {
    this.primaryCommodity.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: any) => {
        if (value && this.otherCommodities.value) {
          const index: any = this.otherCommodities.value.findIndex((elm: any) => elm.id === value)
          if (index >= 0) {
            const obj = this.otherCommodities.value[index]
            MessageDialog.warning(`${obj.name} has been removed from other commodities`)
            this.otherCommodities.value.splice(index, 1)
            this.otherCommodities.patchValue(this.otherCommodities.value, { emitEvent: false })
          }
        }
      })
  }
}
