import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from 'src/app/shared/common-entities.model';
import { Subscriber, SubscriberGroup } from './subscriber.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {

  constructor(private http: HttpClient) { }

  fetchLanguages() {
    return this.http.get<Lookup[]>(`${environment.baseUrl}/languages`)
  }

  fetchDistricts() {
    return this.http.get<Lookup[]>(`${environment.baseUrl}/districts`)
  }

  fetchSubscribers() {
    return this.http.get<Subscriber[]>(`${environment.baseUrl}/subscribers`)
      // .pipe(
      //   map(res => {
      //     if (res.success) return res.data
      //   })
      // )
  }

  findSubscriber(id: number) {
    return this.http.get<Subscriber>(`${environment.baseUrl}/subscribers/${id}`)
  }

  deleteSubscriber(id: number) {
    return this.http.delete<Subscriber>(`${environment.baseUrl}/subscribers/${id}`)
  }

  saveSubscriber(params: Subscriber) {
    if (params.id) return this.http.put<Subscriber>(`${environment.baseUrl}/subscribers`, params)
    return this.http.post<Subscriber>(`${environment.baseUrl}/subscribers`, params)
  }

  fetchSubscriberGroups() {
    return this.http.get<SubscriberGroup[]>(`${environment.baseUrl}/subscribergroups`)
      // .pipe(
      //   map(res => {
      //     if (res.success) return res.data
      //   })
      // )
  }

  deleteSubscriberGroup(id: number) {
    return this.http.delete<SubscriberGroup>(`${environment.baseUrl}/subscribergroups/${id}`)
  }

  saveSubscriberGroup(params: SubscriberGroup) {
    if (params.id) return this.http.put<SubscriberGroup>(`${environment.baseUrl}/subscribergroups`, params)
    return this.http.post<SubscriberGroup>(`${environment.baseUrl}/subscribergroups`, params)
  }

  findSubscriberGroup(id: number) {
    return this.http.get<SubscriberGroup>(`${environment.baseUrl}/subscribergroups/${id}`)
  }
}
