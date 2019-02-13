import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ProfileService } from '../shared/profile.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  passwordForm: FormGroup
  @BlockUI() blockUi: NgBlockUI

  constructor(private fb: FormBuilder,
    private profileService: ProfileService) {
    this.buildForm()
  }

  ngOnInit() {
  }

  changePassword() {
    const params = this.passwordForm.value
    this.blockUi.start("Saving...")
    this.profileService.changePassword(params).subscribe((res) => {
      this.blockUi.stop()
      if (res.success) {
        this.passwordForm.reset()
      }
    }, err => {
      this.blockUi.stop()
    })
  }

  private buildForm() {
    this.passwordForm = this.fb.group({
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])),
      passwordConfirmation: new FormControl('', Validators.required)
    }, { validator: this.checkPasswords })
  }

  private checkPasswords(formGroup: FormGroup) {
    if (!formGroup.controls) return null;
    return formGroup.controls['newPassword'].value === formGroup.controls['passwordConfirmation'].value ? null : { passwordMismatch: true }
  }
}
