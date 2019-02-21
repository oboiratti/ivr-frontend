import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { SubscriberService } from '../shared/subscriber.service';
import { Observable, Subscription } from 'rxjs';
import { Subscriber } from '../shared/subscriber.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';

@Component({
  selector: 'app-subscriber-list',
  templateUrl: './subscriber-list.component.html',
  styleUrls: ['./subscriber-list.component.scss']
})
export class SubscriberListComponent implements OnInit, OnDestroy {
  
  subscribers$: Observable<Subscriber[]>
  @BlockUI() blockUi: NgBlockUI
  deleteSubscription: Subscription

  constructor(private router: Router,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    this.getSubscribers()
  }

  ngOnDestroy() {
    this.deleteSubscription.unsubscribe()
  }

  openForm() {
    this.router.navigateByUrl(RouteNames.subscriberForm)
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberForm}/${id}`)
  }

  delete(id: number) {
    MessageDialog.confirm("Delete Subscriber", "Are you sure you want to delete this subscriber?").then(confirm => {
      if (confirm.value) {
        this.blockUi.start("Deleting...")
        this.deleteSubscription = this.subscriberService.deleteSubscriber(id).subscribe(res => {
          this.blockUi.stop()
          this.getSubscribers()
        }, () => this.blockUi.stop())
      }
    })
  }

  private getSubscribers() {
    this.blockUi.start("Loading...")
    this.subscribers$ = this.subscriberService.fetchSubscribers().pipe(
      finalize(() => this.blockUi.stop())
    )
  }
}
