import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from '../common-entities.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportFilterService {

  constructor(private http: HttpClient) { }

  fetch(url: string) {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/${url}`)
  }
}
