import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { SubscriberGroup, Subscriber } from 'src/app/subscriber/shared/subscriber.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriberService } from 'src/app/subscriber/shared/subscriber.service';
import { CampaignService } from '../shared/campaign.service';
import { RouteNames } from 'src/app/shared/constants';

@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.scss']
})
export class ScheduleFormComponent implements OnInit {

  subscriberTypes = [
    {label: 'All Subscribers', value: 3},
    {label: 'Selected Groups', value: 2},
    {label: 'Selected Subscribers', value: 1}]
  scheduleTypes = [
    {label: 'Now', value: 1},
    {label: 'Fixed Date', value: 2},
    {label: 'Routine', value: 3},
    {label: 'Repeating', value: 4}]
  periods = [
      {label: 'Days', value: 0},
      {label: 'Weeks', value: 1},
      {label: 'Months', value: 2},
      {label: 'Years', value: 3}]
  form: FormGroup
  groups$: Observable<SubscriberGroup[]>
  subscribers$: Observable<Subscriber[]>
  toggleIcon = 'fa fa-chevron-right'
  toggle = false
  id: number
  @BlockUI() blockUi: NgBlockUI

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.setupForm()
    this.loadGroups()
    this.loadSubscribers()
    this.id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (this.id) {  this.findCampaign(this.id) }
  }

  doToggle() {
    this.toggle = !this.toggle
    this.toggleIcon = this.toggle ? 'fa fa-chevron-down' : 'fa fa-chevron-right'
  }

  save(formData: any) {
    const params = this.buildJsonRequest(formData)
    console.log(params);
    this.blockUi.start('Saving...')
    this.campaignService.saveCampaign(params).subscribe(res => {
      this.blockUi.stop()
      if (res.success) { this.closeForm() }
    }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.id}/${RouteNames.schedules}`)
  }

  get name() {return this.form.get('name')}
  get campaignRecipientType() {return this.form.get('campaignRecipientType')}
  get scheduleType() {return this.form.get('scheduleType')}
  get selectedSubscribers() {return this.form.get('selectedSubscribers')}
  get subscriberGroups() {return this.form.get('subscriberGroups')}
  get repeatEnds() {return this.form.get('repeatEnds')}
  get treeVersion() {return this.form.get('treeVersion')}
  get voiceSenderId() {return this.form.get('voiceSenderId')}

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(null),
      name: new FormControl('', Validators.required),
      campaignRecipientType: new FormControl(null, Validators.required),
      scheduleType: new FormControl(null, Validators.required),
      selectedSubscribers: new FormControl(null),
      subscriberGroups: new FormControl(null),
      sendDate: new FormControl(new Date().toISOString().substring(0, 10)),
      sendTime: new FormControl(new Date().toISOString().substring(11, 16)),
      routineDays: new FormControl(null),
      routineTime: new FormControl(new Date().toISOString().substring(11, 16)),
      repeatNumber: new FormControl(null),
      repeatPeriod: new FormControl(null),
      repeatStartDate: new FormControl(new Date().toISOString().substring(0, 10)),
      repeatEnds: new FormControl('Never'),
      repeatEndsAfterOccurances: new FormControl(null),
      repeatEndsDate: new FormControl(new Date().toISOString().substring(0, 10)),
      repeatEndsTime: new FormControl(new Date().toISOString().substring(11, 16)),
      tree: new FormControl(null),
      treeVersion: new FormControl(null),
      dontCallBefore: new FormControl(null),
      dontCallAfter: new FormControl(null),
      retryTime: new FormControl(null),
      minutesApart: new FormControl(null),
      detectVoicemail: new FormControl(false),
      voiceSenderId: new FormControl(''),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    })
  }

  private loadGroups() {
    this.groups$ = this.subscriberService.fetchSubscriberGroups()
  }

  private loadSubscribers() {
    this.subscribers$ = this.subscriberService.fetchSubscribers()
  }

  private buildJsonRequest(formData: any) {
    return {
      id: formData.id,
      name: formData.name,
      campaignType: 'Outbound',
      campaignRecipientType: formData.campaignRecipientType,
      campaignSubscribers: [{
        selectedSubscribers: formData.campaignRecipientType === 1 ? formData.selectedSubscribers.join() : null,
        subscriberGroups: formData.campaignRecipientType === 2 ? formData.subscriberGroups.join() : null
      }],
      scheduleType: formData.scheduleType,
      scheduleDetails: JSON.stringify({
        sendDate: formData.scheduleType === 2 ? formData.sendDate : null,
        sendTime: formData.scheduleType === 2 ? formData.sendTime : null,
        routineDays: formData.scheduleType === 3 ? formData.routineDays : null,
        routineTime: formData.scheduleType === 3 ? formData.routineTime : null,
        repeatNumber: formData.scheduleType === 4 ? formData.repeatNumber : null,
        repeatPeriod: formData.scheduleType === 4 ? formData.repeatPeriod : null,
        repeatStartDate: formData.scheduleType === 4 ? formData.repeatStartDate : null,
        repeatEnds: formData.scheduleType === 4 ? formData.repeatEnds : null,
        repeatEndsDetails: formData.repeatEnds !== 'Never' ?  {
          repeatEndsAfterOccurances: formData.repeatEnds === 'AfterOccurances' ? formData.repeatEndsAfterOccurances : null,
          repeatEndsDate: formData.repeatEnds === 'On' ? formData.repeatEndsDate : null,
          repeatEndsTime: formData.repeatEndsTime
        } : {}
      }),
      advancedOptions: JSON.stringify({
        voiceOptions: {
          dontCallBefore: formData.dontCallBefore,
          dontCallAfter: formData.dontCallAfter
        },
        callRetryOptions: {
          retryTime: formData.retryTime,
          minutesApart: formData.minutesApart
        },
        detectVoicemail: formData.detectVoicemail,
        voiceSenderId: formData.voiceSenderId
      }),
      createdAt: formData.createdAt,
      createdBy: formData.createdBy,
      updatedAt: formData.updatedAt,
      updatedBy: formData.updatedBy
    }
  }

  private findCampaign(id: number) {
    this.blockUi.start('Loading...')
    this.campaignService.findCampaign(id).subscribe(res => {
      this.blockUi.stop()
      if (res.success) {
        const data = res.data
        this.doToggle()
        console.log(data);

        this.form.patchValue(data)
        this.form.patchValue({
          campaignRecipientType: data.campaignRecipientType.id,
          scheduleType: data.scheduleType.id,
          sendDate: data.scheduleDetails.sendDate,
          sendTime: data.scheduleDetails.sendTime,
          routineDays: data.scheduleDetails.routineDays,
          routineTime: data.scheduleDetails.routineTime,
          repeatNumber: data.scheduleDetails.repeatNumber,
          repeatPeriod: data.scheduleDetails.repeatPeriod,
          repeatStartDate: data.scheduleDetails.repeatStartDate,
          repeatEnds: data.scheduleDetails.repeatEnds,
          repeatEndsAfterOccurances: data.scheduleDetails.repeatEndsDetails.repeatEndsAfterOccurances ,
          repeatEndsDate: data.scheduleDetails.repeatEndsDetails.repeatEndsDate ,
          repeatEndsTime: data.scheduleDetails.repeatEndsDetails.repeatEndsTime,
          dontCallBefore: data.advancedOptions.voiceOptions.dontCallBefore,
          dontCallAfter: data.advancedOptions.voiceOptions.dontCallAfter,
          retryTime: data.advancedOptions.callRetryOptions.retryTime,
          minutesApart: data.advancedOptions.callRetryOptions.minutesApart,
          detectVoicemail: data.advancedOptions.detectVoicemail,
          voiceSenderId: data.advancedOptions.voiceSenderId,
          selectedSubscribers: data.campaignSubscribers[0].selectedSubscribers ? data.campaignSubscribers[0].selectedSubscribers.split(',').map(Number) : [],
          subscriberGroups: data.campaignSubscribers[0].subscriberGroups ? data.campaignSubscribers[0].subscriberGroups.split(',').map(Number) : []
        })
      }
    }, () => this.blockUi.stop())
  }
}
