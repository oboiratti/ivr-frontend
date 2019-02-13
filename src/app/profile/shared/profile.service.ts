import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Profile, ChangePasswordParams } from './profile.model';
import { ResponseObject } from '../../shared/common-entities.model';
import { User } from '../../auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseApi = environment.apiUrl

  constructor(private httpClient: HttpClient) { }

  updateProfile(params: Profile) {
    return this.httpClient.post<ResponseObject<User>>(`${this.baseApi}/auth/updateprofile`, params)
  }

  changePassword(params: ChangePasswordParams) {
    return this.httpClient.post<ResponseObject<User>>(`${this.baseApi}/auth/change-password`, params)
  }
}
