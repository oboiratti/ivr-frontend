import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from 'src/app/shared/common-entities.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { CampaignQuery, Campaign, CampaignSchedule, CampaignScheduleQuery } from './campaign.models';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  constructor(private http: HttpClient) { }

  saveCampaign(params: Campaign) {
    if (params.id) { return this.http.put<ResponseObject<any>>(`${environment.baseUrl}/campaign`, params) }
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/campaign`, params)
  }

  fetchCampaigns() {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/campaign`)
      .pipe(
        map(res => {
          if (res.success) {
            res.data = res.data.map(data => {
              data.scheduleDetails = JSON.parse(JSON.parse(data.scheduleDetails))
              data.advancedOptions = JSON.parse(JSON.parse(data.advancedOptions))
              return data
            });
            return res.data
          }
        })
      )
  }

  queryCampaigns(params: CampaignQuery) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/campaign/query`, params)
      .pipe(
        map(res => {
          if (res.success) {
            return res.data
          }
        })
      )
  }

  findCampaign(id: number) {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/campaign/get/${id}`)
  }

  deleteCampaign(id: number) {
    return this.http.delete<ResponseObject<any>>(`${environment.baseUrl}/campaign/delete/${id}`)
  }

  fetchTopicsByPillar(pillarId: number) {
    return this.http.get<ResponseObject<Lookup[]>>(`${environment.baseUrl}/topic/gettopics?pillarId=${pillarId}`)
    .pipe(
      map(res => {
        if (res.success) { return res.data }
      })
    )
  }

  saveCampaignSchedule(params: CampaignSchedule) {
    if (params.id) { return this.http.put<ResponseObject<any>>(`${environment.baseUrl}/campaignschedule`, params) }
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/campaignschedule`, params)
  }

  queryCampaignSchedules(params: CampaignScheduleQuery) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/campaignschedule/query`, params)
      .pipe(
        map(res => {
          if (res.success) {
            return res.data
          }
        })
      )
  }

  findCampaignSchedule(id: number) {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/campaignschedule/get/${id}`)
  }

  deleteCampaignSchedule(id: number) {
    return this.http.delete<ResponseObject<any>>(`${environment.baseUrl}/campaignschedule/delete/${id}`)
  }
}
