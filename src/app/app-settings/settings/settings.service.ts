import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from '../../shared/common-entities.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export class LookUps {
  static get models() {
    return [
      {label: 'Region', description: 'Add, Edit and Delete Regions', name: 'region', icon: 'fa fa-globe'},
      {label: 'District', description: 'Add, Edit and Delete Districts', name: 'district', icon: 'fa fa-globe'},
      {label: 'Language', description: 'Add, Edit and Delete Languages', name: 'language', icon: 'fa fa-language'},
      {label: 'Tag', description: 'Add, Edit and Delete Tags', name: 'tags', icon: 'fa fa-tag'},
      {label: 'Subscriber Type', description: 'Add, Edit and Delete Subscriber Types', name: 'subscriberType', icon: 'fa fa-address-book'},
      {label: 'Educational Level', description: 'Add, Edit and Delete Educational Levels', name: 'educationalLevel', icon: 'fa fa-graduation-cap'},
      {label: 'Commodity', description: 'Add, Edit and Delete Commodities', name: 'commodity', icon: 'fa fa-th-list'}
    ];
  }
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  model: any;
  baseApi = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  fetch(name: string) {
    return this.httpClient.get<ResponseObject<any>>(`${this.baseApi}/${name}`);
  }

  fetch2(name: string) {
    return this.httpClient.get<ResponseObject<any>>(`${this.baseApi}/${name}`).pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    );
  }

  save(name: string, params: any) {
    if (params.id) { return this.httpClient.put<ResponseObject<any>>(`${this.baseApi}/${name}`, params); }
    return this.httpClient.post<ResponseObject<any>>(`${this.baseApi}/${name}`, params);
  }

  destroy(name: string, id: number) {
    return this.httpClient.delete<ResponseObject<any>>(`${this.baseApi}/${name}/${id}`);
  }
}
