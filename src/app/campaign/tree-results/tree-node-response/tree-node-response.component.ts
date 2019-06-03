import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TreeService } from 'src/app/content/shared/tree.service';
import { Observable } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { DateHelpers } from 'src/app/shared/utils';
import { RouteNames } from 'src/app/shared/constants';
import { TreeNodeResponseQuery } from '../../shared/campaign.models';
import { SettingsService } from 'src/app/app-settings/settings/settings.service';
import { District, Lookup } from 'src/app/shared/common-entities.model';

@Component({
  selector: 'app-tree-node-response',
  templateUrl: './tree-node-response.component.html',
  styleUrls: ['./tree-node-response.component.scss']
})
export class TreeNodeResponseComponent implements OnInit {

  campaignId: number
  treeId: number
  key: string
  responses$: Observable<any>
  @BlockUI() blockUi: NgBlockUI
  filter = <TreeNodeResponseQuery>{};
  name = ''
  lastFilter: TreeNodeResponseQuery;
  pageSizes = [10, 20, 50, 100]
  totalRecords = 0;
  currentPage = 1;
  size = this.pageSizes[1];
  genders = ['Male', 'Female']
  districts$: Observable<District>
  groups$: Observable<Lookup>

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private treeService: TreeService,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    this.treeId = +this.activatedRoute.snapshot.paramMap.get('tid')
    this.key = this.activatedRoute.snapshot.paramMap.get('key')
    this.getNodeResponses(<TreeNodeResponseQuery>{treeId: this.treeId, campaignId: this.campaignId, key: this.key})
    this.loadDistricts()
    this.loadGroups()
  }

  secondsToTime(seconds: number) {
    return DateHelpers.secondsToTime(seconds)
  }

  results() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.campaignId}/${RouteNames.treeResults}/${this.treeId}`)
  }

  getNodeResponses(filter: TreeNodeResponseQuery) {
    filter.page = filter.page || 1
    filter.size = filter.size || this.size
    filter.treeId = this.treeId
    filter.campaignId = this.campaignId
    filter.key = this.key
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start()
    this.responses$ = this.treeService.getNodeResponses(filter).pipe(
      finalize(() => {
        this.totalRecords = this.treeService.totalTreeNodeResponses
        this.blockUi.stop()
      })
    )
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.page = page;
    this.blockUi.start('Loading...');
    this.responses$ = this.treeService.getNodeResponses(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  pageSizeChangeEvent() {
    this.filter.page = 1
    this.filter.size = this.size
    this.getNodeResponses(this.filter)
  }

  private loadDistricts() {
    this.districts$ = this.settingsService.fetch2('district')
  }

  private loadGroups() {
    this.groups$ = this.settingsService.fetch2('group')
  }
}
