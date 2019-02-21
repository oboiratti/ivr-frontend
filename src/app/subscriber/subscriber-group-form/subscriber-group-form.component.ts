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
    if (id) this.findSubscriberGroup(id)
  }

  ngOnDestroy() {
    this.saveSubscription.unsubscribe()
    this.findSubscription.unsubscribe()
  }

  save(formData: SubscriberGroup) {
    this.blockUi.start("Saving...")
    this.saveSubscription = this.subscriberService.saveSubscriberGroup(formData).subscribe(res => {
      this.blockUi.stop()
      this.closeForm()
    }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberGroupList}`)
  }

  get name() {return this.form.get('name')}
  get description() {return this.form.get('description')}
  get subscribers() {return this.form.get('subscribers')}

  private setupForm() {
    this.form = this.fb.group({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      subscribers: new FormControl('')
    })
  }

  private loadSubscribers() {
    this.subscribers$ = this.subscriberService.fetchSubscribers()
  }

  private findSubscriberGroup(id: number) {
    this.blockUi.start("Loading...")
    this.findSubscription = this.subscriberService.findSubscriberGroup(id).subscribe(data => {
      this.blockUi.stop()
      this.form.patchValue(data)
      this.form.patchValue({subscribers: data.subscribers.map(sub => {return sub.id})})
    }, () => this.blockUi.stop())
  }
}
