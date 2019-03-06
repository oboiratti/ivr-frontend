import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../shared/campaign.service';
import { Observable, Subscriber } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';
import { CampaignQuery } from '../shared/campaign.models';

@Component({
  selector: 'app-outbound',
  templateUrl: './outbound-list.component.html',
  styleUrls: ['./outbound-list.component.scss']
})
export class OutboundListComponent implements OnInit {

  campaigns$: Observable<any>
  @BlockUI() blockUi: NgBlockUI
  lastFilter: CampaignQuery
  totalRecords = 0
	currentPage = 1
	recordSize = 20
	totalPages = 1
	pageNumber = 1

  constructor(private router: Router,
    private campaignService: CampaignService) { }

  ngOnInit() {
    this.getCampaigns(<CampaignQuery>{})
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
          if (res.success) this.getCampaigns(<CampaignQuery>{})
        }, () => this.blockUi.stop())
      }
    })
  }

  pageChanged(page: number) {
		this.currentPage = page;
		this.lastFilter.pager.page = page;
		this.blockUi.start("Loading...")
		this.campaigns$ = this.campaignService.fetchCampaigns().pipe(
      finalize(() => this.blockUi.stop())
    )
	}

  private getCampaigns(filter: CampaignQuery) {
    filter.pager = filter.pager || { page: 1, size: this.recordSize };
		this.lastFilter = Object.assign({}, filter);
    this.blockUi.start("Loading...")
    this.campaigns$ = this.campaignService.queryCampaigns(filter).pipe(
      finalize(() => this.blockUi.stop())
    )
  }
}
