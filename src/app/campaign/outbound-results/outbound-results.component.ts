import { Component, OnInit, OnDestroy } from '@angular/core';
import { CampaignService } from '../shared/campaign.service';
import { takeUntil } from 'rxjs/operators';
import { Campaign, CampaignScheduleQuery } from '../shared/campaign.models';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-outbound-results',
  templateUrl: './outbound-results.component.html',
  styleUrls: ['./outbound-results.component.scss']
})
export class OutboundResultsComponent implements OnInit, OnDestroy {

  campaign: Campaign
  unsubscribe$ = new Subject<void>()
  campaignId: number

  constructor(private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    if (this.campaignId) {
      this.findCampaign(this.campaignId)
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  private findCampaign(id: number) {
    this.campaignService.findCampaign(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res.success) {
          this.campaign = res.data
        }
      })
  }
}
