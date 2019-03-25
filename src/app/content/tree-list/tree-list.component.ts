import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouteNames } from 'src/app/shared/constants';
import { TreeService } from '../shared/tree.service';
import { Observable, Subscription } from 'rxjs';
import { Tree, TreeQuery } from '../shared/tree.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Lookup } from 'src/app/shared/common-entities.model';

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.scss']
})
export class TreeListComponent implements OnInit, OnDestroy {

  records$: Observable<Tree[]>;
  @BlockUI() blockUi: NgBlockUI;
  deleteTree: Subscription;
  lastFilter: TreeQuery;
  status: string;
  totalRecords = 0;
  currentPage = 1;
  recordSize = 20;
  totalPages = 1;
  pageNumber = 1;
  languages$: Observable<Lookup[]>;
  currentRecId: number;

  constructor(private router: Router,
    private treeService: TreeService) { }

  ngOnInit() {
    this.status = 'Active';
    this.getTree(<TreeQuery>{});
    this.loadLanguages();
  }

  ngOnDestroy() {
    if (this.deleteTree) { this.deleteTree.unsubscribe(); }
  }

  changeTab(tab: string) {
    this.status = tab;
    this.getTree(<TreeQuery>{});
  }

  openForm() {
    this.router.navigateByUrl(RouteNames.treeList);
  }

  open(id: number) {
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.treeListDets}/${id}`);
  }

  openTree(id: number) {
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.treeStudio}/${id}`);
  }

  private loadLanguages() {
    this.languages$ = this.treeService.fetchLanguages();
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.lastFilter.pager.page = page;
    this.lastFilter.status = this.status;
    this.blockUi.start('Loading Trees...');
    this.records$ = this.treeService.queryTree(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }

  private getTree(filter: TreeQuery) {
    filter.pager = filter.pager || { page: 1, size: this.recordSize };
    filter.status = this.status;
    this.lastFilter = Object.assign({}, filter);
    this.blockUi.start('Loading Trees...');
    this.records$ = this.treeService.queryTree(this.lastFilter).pipe(
      finalize(() => this.blockUi.stop())
    );
  }
}
