import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Lookup } from 'src/app/shared/common-entities.model';
import { MediaService } from '../shared/media.service';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { RouteNames } from 'src/app/shared/constants';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Media } from '../shared/media.model';

@Component({
  selector: 'app-media-form',
  templateUrl: './media-form.component.html',
  styleUrls: ['./media-form.component.scss']
})
export class MediaFormComponent implements OnInit, OnDestroy {

  form: FormGroup;
  languages$: Observable<Lookup[]>;
  tags$: Observable<Lookup[]>;
  @BlockUI() blockUi: NgBlockUI;
  saveSubscription: Subscription;
  findSubscription: Subscription;
  types = ['Message', 'Survey'];
  formType: string;

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mediaService: MediaService) { }

  ngOnInit() {
    this.setupForm();
    this.loadLanguages();
    this.loadTags();
    this.formType = 'New';
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.findMedia(id);
      this.formType = 'Update';
    }
  }

  ngOnDestroy() {
    if (this.saveSubscription) { this.saveSubscription.unsubscribe(); }
    if (this.findSubscription) { this.findSubscription.unsubscribe(); }
  }

  save(formData: any) {
    const params = formData;
    if (params.tagsList) {
      params.tags = params.tagsList.join();
    }
    this.blockUi.start('Uploading Media...');
    this.saveSubscription = this.mediaService.saveMedia(params).subscribe(res => {
      this.blockUi.stop();
      if (res.success) { this.closeForm(); }
    }, () => this.blockUi.stop());
  }

  closeForm() {
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.mediaLibrary}`);
  }

  get id() { return this.form.get('id'); }
  get title() { return this.form.get('title'); }
  get description() { return this.form.get('description'); }
  get languageId() { return this.form.get('languageId'); }
  get tagsList() { return this.form.get('tagsList'); }
  get type() { return this.form.get('type'); }
  get filePath() { return this.form.get('filePath'); }
  get fileName() { return this.form.get('fileName'); }

  private setupForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      title: new FormControl('', Validators.required),
      languageId: new FormControl('', Validators.required),
      type: new FormControl('Message', Validators.required),
      filePath: new FormControl(null, Validators.required),
      description: new FormControl(''),
      tagsList: new FormControl(''),
      createdAt: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedAt: new FormControl(null),
      modifiedBy: new FormControl(null),
      fileName: new FormControl('')
    });
  }

  private loadLanguages() {
    this.languages$ = this.mediaService.fetchLanguages();
  }

  private loadTags() {
    this.tags$ = this.mediaService.fetchTags();
  }

  private findMedia(id: number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.mediaService.findMedia(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        const data = res.data;
        this.form.patchValue(data);
        /*this.form.patchValue({
          // patch tags
          // startDate: new Date(data.startDate).toISOString().substring(0, 10),
          languageId: data.language.id,
        });*/
      }
    }, () => this.blockUi.stop());
  }

  onFileChange(files: any) {
    const file = files.item(0);
    if (file.size > (4 * 1000 * 1024)) {
      MessageDialog.error('The size of the selected file should not be more than 4Mb.');
      return;
    }
    this.readThis(file);
  }
  readThis(file: any) {
    const myReader = new FileReader();
    myReader.onloadend = (e) => {
      this.form.patchValue({
        filePath: myReader.result,
        fileName: file.name
     });
    };
    myReader.readAsDataURL(file);
  }
}
