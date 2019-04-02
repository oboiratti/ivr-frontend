import { map } from 'rxjs/operators';
import { Injectable, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from '../../shared/common-entities.model';
import { Role } from '../../auth/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private baseApi = environment.apiUrl

  constructor(private httpClient: HttpClient) { }

  fetch() {
    return this.httpClient.get<ResponseObject<Role[]>>(`${this.baseApi}/profile/get`)
      .pipe(
        map(res => {
          if (res.success) { return res.data }
        }));
  }

  permissions() {
    return this.httpClient.get<ResponseObject<any[]>>(`${this.baseApi}/account/getroles`);
  }

  save(role: Role) {
    if (role.id) { return this.httpClient.put<ResponseObject<Role>>(`${this.baseApi}/profile`, role); }
    return this.httpClient.post<ResponseObject<Role>>(`${this.baseApi}/profile`, role);
  }

  destroy(id: number) {
    return this.httpClient.delete<ResponseObject<Role>>(`${this.baseApi}/profile/delete/${id}`);
  }
}
