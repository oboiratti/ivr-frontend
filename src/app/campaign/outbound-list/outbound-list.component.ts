import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../shared/campaign.service';
import { Observable, Subscriber } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';

@Component({
  selector: 'app-outbound',
  templateUrl: './outbound-list.component.html',
  styleUrls: ['./outbound-list.component.scss']
})
export class OutboundListComponent implements OnInit {

  campaigns$: Observable<any>
  @BlockUI() blockUi: NgBlockUI

  constructor(private router: Router,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.getCampaigns()
  }

  editForm(id: number) {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outboundForm}/${id}`)
  }

  delete(id: number) {
    MessageDialog.confirm("Delete Campaign", "Are you sure you want to delete this campaign?").then(confirm => {
      if (confirm.value) {
        this.blockUi.start("Deleting...")
        this.campaignService.deleteCampaign(id).subscribe(res => {
          this.blockUi.stop()
          if (res.success) this.getCampaigns()
        }, () => this.blockUi.stop())
      }
    })
  }

  private getCampaigns() {
    this.blockUi.start("Loading...")
    this.campaigns$ = this.campaignService.fetchCampaigns().pipe(
      finalize(() => this.blockUi.stop())
    )
  }
}
