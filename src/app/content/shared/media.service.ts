import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from 'src/app/shared/common-entities.model';
import { Media, MediaQuery} from './media.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(private http: HttpClient) { }

  fetchLanguages() {
    return this.http.get<ResponseObject<Lookup[]>>(`${environment.baseUrl}/language`)
    .pipe(
      map(res => {
        if (res.success) { return res.data; }
      })
    );
  }

  fetchTags() {
    return this.http.get<ResponseObject<Lookup[]>>(`${environment.baseUrl}/tags`)
    .pipe(
      map(res => {
        if (res.success) { return res.data; }
      })
    );
  }

  fetchMedia() {
    return this.http.get<ResponseObject<Media[]>>(`${environment.baseUrl}/medialibrary`)
      .pipe(
        map(res => {
          if (res.success) { return res.data; }
        })
      );
  }

  queryMedia(params: MediaQuery) {
    return this.http.post<ResponseObject<Media[]>>(`${environment.baseUrl}/medialibrary/query`, params)
      .pipe(
        map(res => {
          if (res.success) { return res.data; }
        })
      );
  }

  findMedia(id: number) {
    return this.http.get<ResponseObject<Media>>(`${environment.baseUrl}/medialibrary/get/${id}`);
  }

  deleteMedia(id: number) {
    return this.http.delete<ResponseObject<Media>>(`${environment.baseUrl}/medialibrary/${id}`);
  }

  saveSubscriber(params: Media) {
    if (params.id) { return this.http.put<ResponseObject<Media>>(`${environment.baseUrl}/subscriber`, params); }
    return this.http.post<ResponseObject<Media>>(`${environment.baseUrl}/medialibrary`, params);
  }
}
