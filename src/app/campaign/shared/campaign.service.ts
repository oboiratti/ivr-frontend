import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject } from 'src/app/shared/common-entities.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  constructor(private http: HttpClient) { }

  saveCampaign(params: any) {
    if (params.id) return this.http.put<ResponseObject<any>>(`${environment.baseUrl}/campaign`, params)
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

  findCampaign(id: number) {
    return this.http.get<ResponseObject<any>>(`${environment.baseUrl}/campaign/get/${id}`)
      .pipe(
        map(res => {
          if (res.success) {
            res.data.scheduleDetails = JSON.parse(JSON.parse(res.data.scheduleDetails))
            res.data.advancedOptions = JSON.parse(JSON.parse(res.data.advancedOptions))
            return res
          }
        })
      )
  }

  deleteCampaign(id: number) {
    return this.http.delete<ResponseObject<any>>(`${environment.baseUrl}/campaign/delete/${id}`)
  }
}
