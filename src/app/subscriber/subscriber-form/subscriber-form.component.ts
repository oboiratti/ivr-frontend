import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Lookup } from 'src/app/shared/common-entities.model';
import { SubscriberService } from '../shared/subscriber.service';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Subscriber, SubscriberGroup } from '../shared/subscriber.model';

@Component({
  selector: 'app-subscriber-form',
  templateUrl: './subscriber-form.component.html',
  styleUrls: ['./subscriber-form.component.scss']
})
export class SubscriberFormComponent implements OnInit, OnDestroy {

  form: FormGroup
  languages$: Observable<Lookup[]>
  districts$: Observable<Lookup[]>
  groups$: Observable<SubscriberGroup[]>
  @BlockUI() blockUi: NgBlockUI
  saveSubscription: Subscription
  findSubscription: Subscription

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    this.setupForm()
    this.loadLanguages()
    this.loadDistricts()
    this.loadGroups()
    const id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (id) this.findSubscriber(id)
  }

  ngOnDestroy() {
    if (this.saveSubscription) this.saveSubscription.unsubscribe()
    if (this.findSubscription) this.findSubscription.unsubscribe()
  }

  save(formData: Subscriber) {
    this.blockUi.start("Saving...")
    this.saveSubscription = this.subscriberService.saveSubscriber(formData).subscribe(res => {
      this.blockUi.stop()
      this.closeForm()
    }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberList}`)
  }

  get id() { return this.form.get('id') }
  get phoneNumber() { return this.form.get('phoneNumber') }
  get name() { return this.form.get('name') }
  get language() { return this.form.get('language') }
  get gender() { return this.form.get('gender') }
  get startDate() { return this.form.get('startDate') }
  get district() { return this.form.get('district') }
  get location() { return this.form.get('location') }
  get voice() { return this.form.get('voice') }
  get sms() { return this.form.get('sms') }
  get comments() { return this.form.get('comments') }
  get subscriberGroups() { return this.form.get('subscriberGroups') }

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
      language: new FormControl('', Validators.required),
      gender: new FormControl('Male', Validators.required),
      startDate: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
      voice: new FormControl(''),
      sms: new FormControl(''),
      comments: new FormControl(''),
      subscriberGroups: new FormControl('')
    })
  }

  private loadLanguages() {
    this.languages$ = this.subscriberService.fetchLanguages()
  }

  private loadDistricts() {
    this.districts$ = this.subscriberService.fetchDistricts()
  }

  private loadGroups() {
    this.groups$ = this.subscriberService.fetchSubscriberGroups()
  }

  private findSubscriber(id: number) {
    this.blockUi.start("Loading...")
    this.findSubscription = this.subscriberService.findSubscriber(id).subscribe(res => {
      this.blockUi.stop()
      if (res.success) {
        const data = res.data
        this.form.patchValue(data)
        this.form.patchValue({
          startDate: new Date(data.startDate).toISOString().substring(0, 10),
          //language: data.language.id,
          //district: data.district.id,
          subscriberGroups: data.subscriberGroups.map(grp => { return grp.id })
        })
      }
    }, () => this.blockUi.stop())
  }
}
