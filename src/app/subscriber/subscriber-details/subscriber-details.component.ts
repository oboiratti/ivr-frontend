import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriberService } from '../shared/subscriber.service';
import { Observable } from 'rxjs';
import { Subscriber } from '../shared/subscriber.model';
import { RouteNames } from 'src/app/shared/constants';

@Component({
  selector: 'app-subscriber-details',
  templateUrl: './subscriber-details.component.html',
  styleUrls: ['./subscriber-details.component.scss']
})
export class SubscriberDetailsComponent implements OnInit {

  @BlockUI() blockUi: NgBlockUI
  subscriber$: Observable<Subscriber>

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriberService: SubscriberService) { }

  ngOnInit() {
    const id = +this.activatedRoute.snapshot.paramMap.get('id')
    if (id) { this.findSubscriber(id) }
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberList}`)
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.subscriber}/${RouteNames.subscriberForm}/${id}`);
  }

  private findSubscriber(id: number) {
    this.blockUi.start('Loading...')
    this.subscriber$ = this.subscriberService.findSubscriber(id)
      .pipe(finalize(() => this.blockUi.stop()))
  }
}
