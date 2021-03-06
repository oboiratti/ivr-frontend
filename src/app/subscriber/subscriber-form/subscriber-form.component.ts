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
  programs$: Observable<Lookup[]>
  groups$: Observable<SubscriberGroup[]>
  unsubscribe$ = new Subject<void>();
  @BlockUI() blockUi: NgBlockUI
  subscriberGroupsCopy: any[]
  otherCommoditiesCopy: any[]
  loadingRegions: boolean
  loadingDistricts: boolean
  loadingSubscriberTypes: boolean
  loadingCommodities: boolean
  loadingGroups: boolean
  loadingPrograms: boolean

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
    params.phoneNumber = (formData.phoneNumber as string).substring(1)
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
    if (!this.id.value) {
      this.patchSubscriberGroups(group.id)
      return
    }

    const match = this.subscriberGroupsCopy.some((val: any) => val === group.id)
    if (!match) {
      this.patchSubscriberGroups(group.id)
      return
    }

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
              this.patchSubscriberGroups(group.id)
            }
          })

      }
    })
  }

  removeCommodity(commodity) {
    if (!this.id.value) {
      this.patchOtherCommodities(commodity.id)
      return
    }

    const match = this.otherCommoditiesCopy.some((val: any) => val.id === commodity.id)
    if (!match) {
      this.patchOtherCommodities(commodity.id)
      return
    }

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
              this.patchOtherCommodities(commodity.id)
            }
          })

      }
    })
  }

  toggleStatus(id: number, action: string) {
    MessageDialog.confirm(`${action} Subscriber`, `Are you sure you want to ${action} this subscriber?`).then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Please wait...')
        this.subscriberService.toggleStatus(id)
          .pipe(
            takeUntil(this.unsubscribe$),
            finalize(() => this.blockUi.stop())
          )
          .subscribe(res => {
            if (res.success) { this.closeForm() }
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
  get programId() { return this.form.get('programId') }
  get status() { return this.form.get('status') }
  get code() { return this.form.get('code') }

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      phoneNumber: new FormControl(null, Validators.compose([
        Validators.required,
        // Validators.minLength(10),
        // Validators.maxLength(10),
        // Validators.pattern('^[0]+[0-9]{9}$')
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
      code: new FormControl(null),
      primaryCommodity: new FormControl(null, Validators.required),
      otherCommodities: new FormControl([]),
      status: new FormControl(null),
      programId: new FormControl(null),
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
    this.loadingDistricts = true
    this.districts$ = this.subscriberService.fetchDistrictsByRegion(regionId).pipe(
      finalize(() => this.loadingDistricts = false)
    )
  }

  private loadRegions() {
    this.loadingRegions = true
    this.regions$ = this.settingsService.fetch2('region').pipe(
      finalize(() => this.loadingRegions = false)
    )
  }

  private loadEducationalLevels() {
    this.educationalLevels$ = this.settingsService.fetch2('educationallevel')
  }

  private loadSubscriberTypes() {
    this.loadingSubscriberTypes = true
    this.subscriberTypes$ = this.settingsService.fetch2('subscribertype').pipe(
      finalize(() => this.loadingSubscriberTypes = false)
    )
  }

  private loadSubscriberTypeCommodities(subscriberTypeId: number) {
    this.loadingCommodities = true
    this.commodities$ = this.subscriberService.fetchCommoditiesBySubscriberType(subscriberTypeId)
      .pipe(
        shareReplay(1),
        finalize(() => this.loadingCommodities = false)
      )
  }

  private loadGroups() {
    this.loadingGroups = true
    this.groups$ = this.subscriberService.fetchSubscriberGroups().pipe(
      finalize(() => this.loadingGroups = false)
    )
  }

  private loadPrograms(commodityId: number) {
    this.loadingPrograms = true
    this.programs$ = this.subscriberService.fetchProgramsByCommodity(commodityId).pipe(
      finalize(() => this.loadingPrograms = false)
    )
  }

  private findSubscriber(id: number) {
    this.blockUi.start('Loading...')
    this.subscriberService.findSubscriber(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.blockUi.stop()
        this.subscriberGroupsCopy = data.subscriberGroups ? data.subscriberGroups.map(grp => grp.groupId) : null
        this.otherCommoditiesCopy = data.otherCommodities ? data.otherCommodities
          .map(elm => {
            return { id: elm.commodityId, name: elm.commodity }
          }) : null
        this.form.patchValue(data)
        this.form.patchValue({
          startDate: new Date(data.startDate).toISOString().substring(0, 10),
          dateOfBirth: new Date(data.dateOfBirth).toISOString().substring(0, 10),
          languageId: data.language.id,
          regionId: data.region.id,
          districtId: data.district.id,
          educationLevelId: data.educationalLevel.educationLevelId,
          subscriberTypeId: data.subscriberType.subscriberTypeId,
          subscriberGroups: this.subscriberGroupsCopy,
          primaryCommodity: data.primaryComodity.commodityId,
          otherCommodities: this.otherCommoditiesCopy,
          programId: data.program.id,
          phoneNumber: `+${data.phoneNumber}`
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
    if (!this.primaryCommodity.value) { this.programId.disable() }
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
          const match: any = value.find((elm: any) => elm.id === this.primaryCommodity.value)
          if (match) {
            MessageDialog.error(`${match.name} has already been added as a primary commodity`)
            this.patchOtherCommodities(match.id, { emitEvent: false })
          }
        }
      })
  }

  private primaryCommodityChangeListener() {
    this.primaryCommodity.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: any) => {
        if (value && this.otherCommodities.value) {
          const match: any = this.otherCommodities.value.find((elm: any) => elm.id === value)
          if (match) {
            MessageDialog.warning(`${match.name} has been removed from other commodities`)
            this.patchOtherCommodities(match.id, { emitEvent: false })
          }
        }
        if (value) {
          this.loadPrograms(value)
          this.programId.enable()
        }
      })
  }

  private patchSubscriberGroups(groupId: number) {
    const groups = (this.subscriberGroups.value as []).filter((val: any) => val !== groupId);
    this.subscriberGroups.patchValue(groups);
  }

  private patchOtherCommodities(commodityId: number, options?: Object) {
    const commodities = (this.otherCommodities.value as []).filter((val: any) => val.id !== commodityId);
    this.otherCommodities.patchValue(commodities, options);
  }
}
