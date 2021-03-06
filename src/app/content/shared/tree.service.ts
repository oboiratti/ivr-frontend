import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseObject, Lookup } from 'src/app/shared/common-entities.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Numeric, Openended, Multichoice, Message, BlockNode, Connection, Tree, TreeQuery, Choice } from '../shared/tree.model';
import { TreeResultsQuery } from 'src/app/campaign/shared/campaign.models';


@Injectable({
  providedIn: 'root'
})
export class TreeService {

  totalTreeNodeResponses: number

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
    return this.http.get<ResponseObject<Tree[]>>(`${environment.baseUrl}/trees/getcompleted`)
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

  getKeyMetrics(params: TreeResultsQuery) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/trees/keymetrics`, params);
  }

  getCompletedInteractions(params: TreeResultsQuery) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/trees/completedinteractions`, params);
  }

  getNodeStats(params: TreeResultsQuery) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/trees/nodestats`, params);
  }

  getNodeResponses(params: { treeId: number, campaignId: number, key: string }) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/trees/noderesponses`, params)
      .pipe(
        map(res => {
          if (res.success) {
            this.totalTreeNodeResponses = res.total
            return res.data;
          }
        })
      );
  }

  findSlimTree(treeId: number, campaignId: number) {
    return this.http.get<ResponseObject<Tree>>(`${environment.baseUrl}/trees/getslim?treeId=${treeId}&campaignId=${campaignId}`)
      .pipe(
        map(res => {
          if (res.success) { return res.data; }
        })
      );
  }

  getTreeResultsFilterList(params: { treeId: number, campaignId: number }) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/trees/getfilterlists`, params);
  }

  getNodeResponsesFilterList(params: { treeId: number, campaignId: number, key: string }) {
    return this.http.post<ResponseObject<any>>(`${environment.baseUrl}/trees/responsesfiltertypes`, params);
  }
}
