import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from '../shared/common-entities.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  getReport(url: string, params?: any) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/${url}`, params)
  }

  downloadFile(url: string, params?: any) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/${url}`, params)
  }
}
