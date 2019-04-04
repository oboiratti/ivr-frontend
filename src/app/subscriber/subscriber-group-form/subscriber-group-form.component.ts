import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SubscriberService } from '../shared/subscriber.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { Subscriber, SubscriberGroup } from '../shared/subscriber.model';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { takeUntil, finalize } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';

@Component({
  selector: 'app-subscriber-group-form',
  templateUrl: './subscriber-group-form.component.html',
  styleUrls: ['./subscriber-group-form.component.scss']
})
export class SubscriberGroupFormComponent implements OnInit, OnDestroy {

  form: FormGroup
  subscribers$: Observable<Subscriber[]>
  @BlockUI() blockUi: NgBlockUI
  unsubscribe$ = new Subject<void>()

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
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  save(formData: any) {
    if (formData.subscribers) {
      formData.subscribers = formData.subscribers.map(elm => {
        return { id: elm }
      })
    }

    this.blockUi.start('Saving...')
    this.subscriberService.saveSubscriberGroup(formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockUi.stop()
        if (res.success) { this.closeForm() }
      }, () => this.blockUi.stop())
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberGroupList}`)
  }

  removeSubscriber(subscriber) {
    if (!this.id.value) {
      const subscribers = (this.subscribers.value as []).filter((val: any) => val !== subscriber.id)
      this.subscribers.patchValue(subscribers)
      return
    }

    MessageDialog.confirm('Remove Subscriber', `Are you sure you want to remove '${subscriber.name}' from this group?`).then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Removing Subscriber...')
        this.subscriberService.removeGroupBySubscriberId(subscriber.id, this.id.value)
          .pipe(
            takeUntil(this.unsubscribe$),
            finalize(() => this.blockUi.stop())
          )
          .subscribe(res => {
            if (res.success) {
              this.blockUi.stop()
              const subscribers = (this.subscribers.value as []).filter((val: any) => val !== subscriber.id)
              this.subscribers.patchValue(subscribers)
            }
          })

      }
    })
  }

  get id() { return this.form.get('id') }
  get name() { return this.form.get('name') }
  get notes() { return this.form.get('notes') }
  get subscribers() { return this.form.get('subscribers') }

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
    this.subscriberService.findSubscriberGroup(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.blockUi.stop()
        if (res.success) { this.form.patchValue(res.data) }
      }, () => this.blockUi.stop())
  }
}
