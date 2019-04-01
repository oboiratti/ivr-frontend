import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from 'src/app/shared/common-entities.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Numeric, Openended, Multichoice, Message, BlockNode , Connection, Tree, TreeQuery, Choice } from '../shared/tree.model';


@Injectable({
  providedIn: 'root'
})
export class TreeService {

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

  fetchTree() {
    return this.http.get<ResponseObject<Tree[]>>(`${environment.baseUrl}/trees`)
      .pipe(
        map(res => {
          if (res.success) { return res.data; }
        })
      );
  }

  queryTree(params: TreeQuery) {
    return this.http.post<ResponseObject<Tree[]>>(`${environment.baseUrl}/trees/query`, params)
      .pipe(
        map(res => {
          if (res.success) { return res.data; }
        })
      );
  }

  findTree(id: number) {
    return this.http.get<ResponseObject<Tree>>(`${environment.baseUrl}/trees/get/${id}`);
  }

  deleteTree(id: number) {
    return this.http.delete<ResponseObject<Tree>>(`${environment.baseUrl}/trees/delete/${id}`);
  }

  saveTree(params: Tree) {
    if (params.id) { return this.http.put<ResponseObject<Tree>>(`${environment.baseUrl}/trees`, params); }
    return this.http.post<ResponseObject<Tree>>(`${environment.baseUrl}/trees`, params);
  }

  activateTree(id: number) {
    return this.http.get<ResponseObject<Tree>>(`${environment.baseUrl}/trees/activate?id=${id}`);
  }

  deactivateTree(id: number) {
    return this.http.get<ResponseObject<Tree>>(`${environment.baseUrl}/trees/deactivate?id=${id}`);
  }

  saveNodes(params: Tree) {
    return this.http.post<ResponseObject<Tree>>(`${environment.baseUrl}/trees/savenodes`, params);
  }
}
