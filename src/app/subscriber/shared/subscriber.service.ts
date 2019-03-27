import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from 'src/app/shared/common-entities.model';
import { Subscriber, SubscriberGroup, SubscriberQuery } from './subscriber.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {

  totalSubscribers = 0

  constructor(private http: HttpClient) { }

  fetchDistrictsByRegion(regionId: number) {
    return this.http.get<ResponseObject<Lookup[]>>(`${environment.baseUrl}/district/getdistricts?regionId=${regionId}`)
    .pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    )
  }

  fetchSubscribers() {
    return this.http.get<ResponseObject<Subscriber[]>>(`${environment.baseUrl}/subscriber`)
      .pipe(
        map(res => {
          if (res.success) { return res.data }
        })
      )
  }

  querySubscribers(params: SubscriberQuery) {
    return this.http.post<ResponseObject<Subscriber[]>>(`${environment.baseUrl}/subscriber/query`, params)
      .pipe(
        map(res => {
          if (res.success) {
            this.totalSubscribers = res.total
            return res.data
          }
        })
      )
  }

  findSubscriber(id: number) {
    return this.http.get<ResponseObject<Subscriber>>(`${environment.baseUrl}/subscriber/get/${id}`)
  }

  deleteSubscriber(id: number) {
    return this.http.delete<ResponseObject<Subscriber>>(`${environment.baseUrl}/subscriber/delete/${id}`)
  }

  saveSubscriber(params: Subscriber) {
    if (params.id) { return this.http.put<ResponseObject<Subscriber>>(`${environment.baseUrl}/subscriber`, params) }
    return this.http.post<ResponseObject<Subscriber>>(`${environment.baseUrl}/subscriber`, params)
  }

  fetchSubscriberGroups() {
    return this.http.get<ResponseObject<SubscriberGroup[]>>(`${environment.baseUrl}/group`)
      .pipe(
        map(res => {
          if (res.success) { return res.data }
        })
      )
  }

  deleteSubscriberGroup(id: number) {
    return this.http.delete<ResponseObject<SubscriberGroup>>(`${environment.baseUrl}/group/delete/${id}`)
  }

  saveSubscriberGroup(params: SubscriberGroup) {
    if (params.id) { return this.http.put<ResponseObject<SubscriberGroup>>(`${environment.baseUrl}/group`, params) }
    return this.http.post<ResponseObject<SubscriberGroup>>(`${environment.baseUrl}/group`, params)
  }

  findSubscriberGroup(id: number) {
    return this.http.get<ResponseObject<SubscriberGroup>>(`${environment.baseUrl}/group/get/${id}`)
  }

  fetchCommoditiesBySubscriberType(subscriberTypeId: number) {
    return this.http.get<ResponseObject<Lookup[]>>(`${environment.baseUrl}/commodity/getcommodities?subscriberTypeId=${subscriberTypeId}`)
    .pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    )
  }

  downloadTemplate() {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/subscriber/downloaduploadtemplate`)
      .pipe(
        map(res => {
          return res;
        })
      )
  }

  saveUploadData(params: any[]) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/subscriber/saveuploaddata`, params)
  }
}
