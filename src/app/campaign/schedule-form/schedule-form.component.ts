import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { SubscriberGroup, Subscriber } from 'src/app/subscriber/shared/subscriber.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriberService } from 'src/app/subscriber/shared/subscriber.service';
import { CampaignService } from '../shared/campaign.service';
import { RouteNames } from 'src/app/shared/constants';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';
import { Lookup } from 'src/app/shared/common-entities.model';
import { TreeService } from 'src/app/content/shared/tree.service';
import { Tree } from 'src/app/content/shared/tree.model';
import { finalize, shareReplay, takeUntil } from 'rxjs/operators';
import { Campaign } from '../shared/campaign.models';

@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.scss']
})
export class ScheduleFormComponent implements OnInit {

  recipientTypes = ['AllSubscribers', 'SelectedGroups', 'SelectedSubscribers']
  scheduleTypes = ['Now', 'FixedDate', 'Repeating']
  periods = ['Days', 'Weeks', 'Months', 'Years']
  form: FormGroup
  groups$: Observable<SubscriberGroup[]>
  subscribers$: Observable<Subscriber[]>
  pillars$: Observable<Lookup[]>
  topics$: Observable<Lookup[]>
  trees$: Observable<Tree[]>
  toggleIcon = 'fa fa-chevron-right'
  toggle = false
  id: number
  sid: number
  @BlockUI() blockUi: NgBlockUI
  loadingTrees: boolean
  loadingPillars: boolean
  loadingTopics: boolean
  loadingGroups: boolean
  loadingSubscribers: boolean
  campaign: Campaign
  unsubscribe$ = new Subject<void>()

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService,
    private campaignService: CampaignService,
    private settingsService: SettingsService,
    private treeService: TreeService) { }

  ngOnInit() {
    this.setupForm()
    this.loadGroups()
    this.loadSubscribers()
    this.loadPillars()
    this.disableControls()
    this.pillarChangeListener()
    this.loadTrees()
    this.id = +this.activatedRoute.snapshot.paramMap.get('id')
    this.sid = +this.activatedRoute.snapshot.paramMap.get('sid')
    if (this.id) { this.findCampaign(this.id) }
    if (this.sid) { this.findCampaignSchedule(this.sid) }
  }

  doToggle() {
    this.toggle = !this.toggle
    this.toggleIcon = this.toggle ? 'fa fa-chevron-down' : 'fa fa-chevron-right'
  }

  save(formData: any) {
    const params = this.buildJsonRequest(formData)
    console.log(params);
    this.blockUi.start('Saving...')
    this.campaignService.saveCampaignSchedule(params)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.blockUi.stop()
      if (res.success) { this.closeForm() }
    }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.id}/${RouteNames.schedules}`)
  }

  get pillarId() { return this.form.get('pillarId') }
  get topicId() { return this.form.get('topicId') }
  get recipientType() { return this.form.get('recipientType') }
  get scheduleType() { return this.form.get('scheduleType') }
  get subscriberIds() { return this.form.get('subscriberIds') }
  get groupIds() { return this.form.get('groupIds') }
  get tree() { return this.form.get('tree') }

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(null),
      pillarId: new FormControl(null, Validators.required),
      topicId: new FormControl(null, Validators.required),
      recipientType: new FormControl(null, Validators.required),
      scheduleType: new FormControl(null, Validators.required),
      subscriberIds: new FormControl(null),
      groupIds: new FormControl(null),
      startDate: new FormControl(new Date().toISOString().substring(0, 10)),
      sendTime: new FormControl(new Date().toISOString().substring(11, 16)),
      endDate: new FormControl(new Date().toISOString().substring(0, 10)),
      frequency: new FormControl(null),
      period: new FormControl(null),
      tree: new FormControl(null, Validators.required),
      treeVersion: new FormControl(null),
      dontCallBefore: new FormControl(null),
      dontCallAfter: new FormControl(null),
      retryTime: new FormControl(null),
      minutesApart: new FormControl(null),
      detectVoicemail: new FormControl(false),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    })
  }

  private loadGroups() {
    this.loadingGroups = true
    this.groups$ = this.subscriberService.fetchSubscriberGroups().pipe(
      shareReplay(1),
      finalize(() => this.loadingGroups = false)
    )
  }

  private loadSubscribers() {
    this.loadingSubscribers = true
    this.subscribers$ = this.subscriberService.fetchSubscribers().pipe(
      shareReplay(1),
      finalize(() => this.loadingSubscribers = false)
    )
  }

  private loadPillars() {
    this.loadingPillars = true
    this.pillars$ = this.settingsService.fetch2('pillar').pipe(
      finalize(() => this.loadingPillars = false)
    )
  }

  private loadTopicsInPillar(pillarId: number) {
    this.loadingTopics = true
    this.topics$ = this.campaignService.fetchTopicsByPillar(pillarId).pipe(
      finalize(() => this.loadingTopics = false)
    )
  }

  private disableControls() {
    if (!this.pillarId.value) { this.topicId.disable() }
  }

  private pillarChangeListener() {
    this.pillarId.valueChanges
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(value => {
      if (value) {
        this.loadTopicsInPillar(value)
        this.topicId.enable()
      }
    })
  }

  private loadTrees() {
    this.loadingTrees = true
    this.trees$ = this.treeService.fetchTree().pipe(
      finalize(() => this.loadingTrees = false)
    )
  }

  private buildJsonRequest(formData: any) {
    return {
      id: formData.id,
      campaignId: this.campaign.id,
      pillarId: formData.pillarId,
      topicId: formData.topicId,
      recipientType: formData.recipientType,
      scheduleType: formData.scheduleType,
      subscriberIds: formData.subscriberIds,
      groupIds: formData.groupIds,
      startDate: formData.startDate,
      sendTime: formData.sendTime,
      endDate: formData.endDate,
      frequency: formData.frequency,
      period: formData.period,
      treeId: formData.tree.id,
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
    this.campaignService.findCampaign(id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.blockUi.stop()
      if (res.success) {
        this.campaign = res.data
      }
    }, () => this.blockUi.stop())
  }

  private findCampaignSchedule(id: number) {
    this.blockUi.start('Loading...')
    this.campaignService.findCampaignSchedule(id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.blockUi.stop()
      if (res.success) {
        this.doToggle()
        const data = res.data
        data.advancedOptions = JSON.parse(data.advancedOptions)
        console.log(data);

        this.form.patchValue(data)
        this.form.patchValue({
          pillarId: data.pillar.id,
          topicId: data.topic.id,
          groupIds: data.groups ? data.groups.map(group => group.id) : null,
          subscriberIds: data.subscribers ? data.subscribers.map(sub => sub.id) : null,
          startDate: data.startDate.substring(0, 10),
          endDate: data.endDate.substring(0, 10),
          dontCallBefore: data.advancedOptions.voiceOptions.dontCallBefore,
          dontCallAfter: data.advancedOptions.voiceOptions.dontCallAfter,
          retryTime: data.advancedOptions.callRetryOptions.retryTime,
          minutesApart: data.advancedOptions.callRetryOptions.minutesApart,
          detectVoicemail: data.advancedOptions.detectVoicemail
        })
      }
    })
  }
}
