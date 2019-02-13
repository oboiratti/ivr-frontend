import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from '../common-entities.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private httpClient: HttpClient) { }

  fetch(name: string) {
    return this.httpClient.get<ResponseObject<any>>(`${environment.apiUrl}/${name}`);
  }
}
