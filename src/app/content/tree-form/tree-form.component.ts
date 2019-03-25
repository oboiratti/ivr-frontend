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
  selector: 'app-tree-form',
  templateUrl: './tree-form.component.html',
  styleUrls: ['./tree-form.component.scss']
})
export class TreeFormComponent implements OnInit, OnDestroy {

  form: FormGroup;
  languages$: Observable<Lookup[]>;
  tags$: Observable<Lookup[]>;
  @BlockUI() blockUi: NgBlockUI;
  saveSubscription: Subscription;
  findSubscription: Subscription;
  formType: string;

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private treeService: TreeService) { }

  ngOnInit() {
    this.setupForm();
    this.loadLanguages();
    this.loadTags();
    this.formType = 'New';
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.findTree(id);
      this.formType = 'Update';
    }
  }

  ngOnDestroy() {
    if (this.saveSubscription) { this.saveSubscription.unsubscribe(); }
    if (this.findSubscription) { this.findSubscription.unsubscribe(); }
  }

  save(formData: any) {
    const params = formData;
    params.tags = params.tagsList.join();
    this.blockUi.start('Saving Tree...');
    this.saveSubscription = this.treeService.saveTree(params).subscribe(res => {
      this.blockUi.stop();
      if (res.success) { this.closeForm(); }
    }, () => this.blockUi.stop());
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.treeList}`);
  }

  get id() { return this.form.get('id'); }
  get title() { return this.form.get('title'); }
  get description() { return this.form.get('description'); }
  get languageId() { return this.form.get('languageId'); }
  get tagsList() { return this.form.get('tagsList'); }

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      title: new FormControl('', Validators.required),
      languageId: new FormControl('', Validators.required),
      description: new FormControl(''),
      tagsList: new FormControl(''),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null)
    });
  }

  private loadLanguages() {
    this.languages$ = this.treeService.fetchLanguages();
  }

  private loadTags() {
    this.tags$ = this.treeService.fetchTags();
  }

  private findTree(id: number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.treeService.findTree(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        const data = res.data;
        this.form.patchValue(data);
      }
    }, () => this.blockUi.stop());
  }
}
