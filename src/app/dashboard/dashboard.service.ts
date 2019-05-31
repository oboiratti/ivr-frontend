import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from '../shared/common-entities.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getSubscriberSummary() {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/dashboard/subscribersummary`).pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    )
  }

  getBySubscriberType(id: number) {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/dashboard/subscribersummarybytype?subscriberTypeId=${id}`).pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    )
  }

  getCommoditySummary() {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/dashboard/subscribersummarybycommodity`)
      // .pipe(
      //   map(res => {
      //     if (res.success) { return res.data }
      //   })
      // )
  }

  getLandArea() {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/dashboard/landareabycommodity`)
      // .pipe(
      //   map(res => {
      //     if (res.success) { return res.data }
      //   })
      // )
  }

  getSustainabilityStatistics(params) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/dashboard/getsustainabilitystatistics`, params).pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    )
  }

  fetchTopicsByPillar(pillarId: number) {
    return this.http.get<ResponseObject<Lookup[]>>(`${environment.baseUrl}/topic/gettopics?pillarId=${pillarId}`)
      .pipe(
        map(res => {
          if (res.success) { return res.data }
        })
      )
  }
}
