import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from '../../shared/common-entities.model';
import { environment } from '../../../environments/environment';

export class LookUps {
  static get models() {
    return [
      {label: "Region", description: "Add, Edit and Delete Regions", name: "region", icon: "fa fa-globe"},
      {label: "District", description: "Add, Edit and Delete Districts", name: "district", icon: "fa fa-globe"},
      {label: "Language", description: "Add, Edit and Delete Language", name: "language", icon: "fa fa-language"},
      {label: "Tag", description: "Add, Edit and Delete Tag", name: "tag", icon: "fa fa-tag"}
    ];
  }
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  model: any;
  baseApi = environment.apiUrl

  constructor(private httpClient: HttpClient) { }

  fetch(name: string) {
    return this.httpClient.get<ResponseObject<any>>(`${this.baseApi}/${name}`);
  }

  save(name: string, params: any) {
    if (params.id) return this.httpClient.put<ResponseObject<any>>(`${this.baseApi}/${name}`, params);
    return this.httpClient.post<ResponseObject<any>>(`${this.baseApi}/${name}`, params);
  }

  destroy(name: string, id: number) {
    return this.httpClient.delete<ResponseObject<any>>(`${this.baseApi}/${name}/${id}`);
  }
}
