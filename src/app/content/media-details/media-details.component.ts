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
  selector: 'app-media-details',
  templateUrl: './media-details.component.html',
  styleUrls: ['./media-details.component.scss']
})
export class MediaDetailsComponent implements OnInit, OnDestroy {

  form: FormGroup;
  @BlockUI() blockUi: NgBlockUI;
  findSubscription: Subscription;
  deleteSubscription: Subscription;
  mediaId: number;
  data: Media;

  constructor(private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mediaService: MediaService) { }

  ngOnInit() {
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.data = <Media>{};
    if (id) {
      this.mediaId = id;
      this.findMedia(id);
    } else {
      this.router.navigateByUrl(`content/${RouteNames.mediaLibrary}`);
    }
  }

  ngOnDestroy() {
    if (this.findSubscription) { this.findSubscription.unsubscribe(); }
  }

  back() {
    this.router.navigateByUrl(`content/${RouteNames.mediaLibrary}`);
  }

  private findMedia(id: number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.mediaService.findMedia(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        this.data = res.data;
      }
    }, () => this.blockUi.stop());
  }

  editForm() {
    const id = this.mediaId;
    this.router.navigateByUrl(`${RouteNames.content}/${RouteNames.mediaLibraryForm}/${id}`);
  }

  delete() {
    MessageDialog.confirm('Delete Media', 'Are you sure you want to delete this media?').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deleting Media...');
        this.deleteSubscription = this.mediaService.deleteMedia(this.mediaId).subscribe(res => {
          this.blockUi.stop();
          this.back();
        }, () => this.blockUi.stop());
      }
    });
  }

  activate() {
    MessageDialog.confirm('Activate Media', 'Please confirm that you want to activate this media file').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Activating Media...');
        this.deleteSubscription = this.mediaService.activateMedia(this.mediaId).subscribe(res => {
          this.blockUi.stop();
          this.findMedia(this.mediaId);
        }, () => this.blockUi.stop());
      }
    });
  }

  deactivate() {
    MessageDialog.confirm('Deactivate Media', 'Please confirm that you want to deactivate this media file').then(confirm => {
      if (confirm.value) {
        this.blockUi.start('Deactivating Media...');
        this.deleteSubscription = this.mediaService.deactivateMedia(this.mediaId).subscribe(res => {
          this.blockUi.stop();
          this.findMedia(this.mediaId);
        }, () => this.blockUi.stop());
      }
    });
  }

  play(rec: any) {
    const audioControl: any = document.getElementById('audio_' + rec.id);
    audioControl.loop = true;
    audioControl.play();
  }
  stop(rec: any) {
    const audioControl: any = document.getElementById('audio_' + rec.id);
    audioControl.pause();
    audioControl.currentTime = 0;
  }
}
