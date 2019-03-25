import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SubscriberService } from '../shared/subscriber.service';
import { Observable, Subscription } from 'rxjs';
import { Subscriber, SubscriberGroup } from '../shared/subscriber.model';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-subscriber-group-form',
  templateUrl: './subscriber-group-form.component.html',
  styleUrls: ['./subscriber-group-form.component.scss']
})
export class SubscriberGroupFormComponent implements OnInit, OnDestroy {

  form: FormGroup
  subscribers$: Observable<Subscriber[]>
  @BlockUI() blockUi: NgBlockUI
  saveSubscription: Subscription
  findSubscription: Subscription

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    this.setupForm()
    this.loadSubscribers()
    const id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (id) { this.findSubscriberGroup(id) }
  }

  ngOnDestroy() {
    if (this.saveSubscription) { this.saveSubscription.unsubscribe() }
    if (this.findSubscription) { this.findSubscription.unsubscribe() }
  }

  save(formData: any) {
    if (formData.subscribers) {
      formData.subscribers = formData.subscribers.map(elm => {
        return { subscriberId: elm }
      })
    }

    this.blockUi.start('Saving...')
    this.saveSubscription = this.subscriberService.saveSubscriberGroup(formData).subscribe(res => {
      this.blockUi.stop()
      if (res.success) { this.closeForm() }
    }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberGroupList}`)
  }

  get name() {return this.form.get('name')}
  get notes() {return this.form.get('notes')}
  get subscribers() {return this.form.get('subscribers')}

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(null),
      name: new FormControl('', Validators.required),
      notes: new FormControl(''),
      subscribers: new FormControl(null),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    })
  }

  private loadSubscribers() {
    this.subscribers$ = this.subscriberService.fetchSubscribers()
  }

  private findSubscriberGroup(id: number) {
    this.blockUi.start('Loading...')
    this.findSubscription = this.subscriberService.findSubscriberGroup(id).subscribe(res => {
      this.blockUi.stop()
      if (res.success) { this.form.patchValue(res.data) }
    }, () => this.blockUi.stop())
  }
}
