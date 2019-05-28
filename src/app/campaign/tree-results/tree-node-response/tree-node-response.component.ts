import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TreeService } from 'src/app/content/shared/tree.service';
import { Observable } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { DateHelpers } from 'src/app/shared/Utils';
import { RouteNames } from 'src/app/shared/constants';

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

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private treeService: TreeService) { }

  ngOnInit() {
    this.campaignId = +this.activatedRoute.snapshot.paramMap.get('id')
    this.treeId = +this.activatedRoute.snapshot.paramMap.get('tid')
    this.key = this.activatedRoute.snapshot.paramMap.get('key')
    this.getNodeResponses()
  }

  secondsToTime(seconds: number) {
    return DateHelpers.secondsToTime(seconds)
  }

  results() {
    this.router.navigateByUrl(`${RouteNames.campaign}/${RouteNames.outbound}/${this.campaignId}/${RouteNames.treeResults}/${this.treeId}`)
  }

  private getNodeResponses() {
    this.blockUi.start()
    const params = {treeId: this.treeId, campaignId: this.campaignId, key: this.key}
    this.responses$ = this.treeService.getNodeResponses(params).pipe(
      finalize(() => this.blockUi.stop())
    )
  }
}
