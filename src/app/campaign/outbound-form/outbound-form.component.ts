import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SubscriberService } from 'src/app/subscriber/shared/subscriber.service';
import { Observable, Subject } from 'rxjs';
import { SubscriberGroup, Subscriber } from 'src/app/subscriber/shared/subscriber.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { CampaignService } from '../shared/campaign.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';
import { Lookup } from 'src/app/shared/common-entities.model';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-outbound-form',
  templateUrl: './outbound-form.component.html',
  styleUrls: ['./outbound-form.component.scss']
})
export class OutboundFormComponent implements OnInit {

  form: FormGroup
  areas$: Observable<Lookup>
  unsubscribe$ = new Subject<void>()
  @BlockUI() blockUi: NgBlockUI
  loadingAreas: boolean

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.setupForm()
    this.loadAreas()
    const id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (id) {  this.findCampaign(id) }
  }

  save(formData: any) {
    this.blockUi.start('Saving...')
    this.campaignService.saveCampaign(formData)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.blockUi.stop()
      if (res.success) { this.closeForm() }
    }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}`)
  }

  get title() {return this.form.get('title')}
  get areaId() {return this.form.get('areaId')}
  get startDate() {return this.form.get('startDate')}
  get endDate() {return this.form.get('endDate')}

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(null),
      title: new FormControl('', Validators.required),
      areaId: new FormControl(null, Validators.required),
      startDate: new FormControl(new Date().toISOString().substring(0, 10), Validators.required),
      endDate: new FormControl(new Date().toISOString().substring(0, 10), Validators.required),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    })
  }

  private findCampaign(id: number) {
    this.blockUi.start('Loading...')
    this.campaignService.findCampaign(id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res => {
      this.blockUi.stop()
      if (res.success) {
        this.form.patchValue(res.data)
        this.form.patchValue({
          areaId: res.data.area.id,
          startDate: res.data.startDate.substring(0, 10),
          endDate: res.data.endDate.substring(0, 10)
        })
      }
    }, () => this.blockUi.stop())
  }

  private loadAreas() {
    this.loadingAreas = true
    this.areas$ = this.settingsService.fetch2('area').pipe(
      finalize(() => this.loadingAreas = false)
    )
  }
}
