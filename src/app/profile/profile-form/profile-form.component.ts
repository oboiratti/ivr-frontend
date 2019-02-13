import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ProfileService } from '../shared/profile.service';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

  image: string | ArrayBuffer
  profileForm: FormGroup
  @BlockUI() blockUi: NgBlockUI

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService) {
    this.buildForm()
  }

  ngOnInit() {
    this.getProfile()
  }

  imageSelected(event) {
    const reader = new FileReader()
    reader.readAsDataURL(event.target.files[0])
    reader.onload = () => {
      this.image = reader.result
      this.profileForm.patchValue({image: this.image})
    }
  }

  getProfile() {
    this.profileForm.patchValue(this.authService.currentUser)
    this.image = this.authService.currentUser.image
  }

  updateProfile() {
    const params = this.profileForm.value
    this.blockUi.start("Updating Profile...")
    this.profileService.updateProfile(params).subscribe((res) => {
      this.blockUi.stop()
      if (res.success) {
        this.authService.setUser(res.data)
      }
    }, err => {
      this.blockUi.stop()
    })
  }

  private buildForm() {
    this.profileForm = this.fb.group({
      id: new FormControl(''),
      name: new FormControl(''),
      email: new FormControl(''),
      phoneNumber: new FormControl(''),
      image: new FormControl('')
    })
  }
}
