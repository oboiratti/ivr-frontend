import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Lookup } from 'src/app/shared/common-entities.model';
import { TreeService } from '../shared/tree.service';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Tree } from '../shared/tree.model';

@Component({
  selector: 'app-tree-details',
  templateUrl: './tree-details.component.html',
  styleUrls: ['./tree-details.component.scss']
})
export class TreeDetailsComponent implements OnInit, OnDestroy {

  form: FormGroup;
  @BlockUI() blockUi: NgBlockUI;
  findSubscription: Subscription;
  deleteSubscription: Subscription;
  treeId: number;
  data: Tree;

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private treeService: TreeService) { }

  ngOnInit() {
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.data = <Tree>{};
    if (id) {
      this.treeId = id;
      this.findTree(id);
    } else {
      this.router.navigateByUrl(`content/${RouteNames.treeList}`);
    }
  }

  ngOnDestroy() {
    if (this.findSubscription) { this.findSubscription.unsubscribe(); }
  }

  back() {
    this.router.navigateByUrl(`content/${RouteNames.treeList}`);
  }

  private findTree(id: number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.treeService.findTree(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        this.data = res.data;
      }
    }, () => this.blockUi.stop());
  }

  editForm() {
    const id = this.treeId;
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.treeListForm}/${id}`);
  }

  openStudio() {
    const id = this.treeId;
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.treeStudio}/${id}`);
  }

  delete() {
    MessageDialog.confirm('Delete Tree', 'Are you sure you want to delete this tree?').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deleting Tree...');
        this.deleteSubscription = this.treeService.deleteTree(this.treeId).subscribe(res => {
          this.blockUi.stop();
          this.back();
        }, () => this.blockUi.stop());
      }
    });
  }

  activate() {
    MessageDialog.confirm('Activate Tree', 'Please confirm that you want to activate this tree file').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Activating Tree...');
        this.deleteSubscription = this.treeService.activateTree(this.treeId).subscribe(res => {
          this.blockUi.stop();
          this.findTree(this.treeId);
        }, () => this.blockUi.stop());
      }
    });
  }

  deactivate() {
    MessageDialog.confirm('Deactivate Tree', 'Please confirm that you want to deactivate this tree file').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deactivating Tree...');
        this.deleteSubscription = this.treeService.deactivateTree(this.treeId).subscribe(res => {
          this.blockUi.stop();
          this.findTree(this.treeId);
        }, () => this.blockUi.stop());
      }
    });
  }
}
