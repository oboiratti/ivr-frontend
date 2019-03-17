import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';


import { User } from '../auth/auth.model';
import { Toast } from './message_helper';

@Injectable()
export class Interceptor implements HttpInterceptor {

    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
         const currentUser: User = JSON.parse(localStorage.getItem('currentUser'));
        // const token = localStorage.getItem("token");
        let authReq = req.clone();
        if (currentUser) {
            authReq = req.clone({ setHeaders: { Authorization: `Bearer ${currentUser.token}` } });
        }

        return next
            .handle(authReq)
            .pipe(
                tap((response: HttpResponse<any>) => {
                    if (response.status === 200 && req.method !== 'GET') {
                        Toast.show(response.body.message, response.body.success);
                    }
                }, err => {
                    console.log(err);

                    if (err.error) {
                        if (err.error.message === 'No message available') {
                            Toast.error(err.error.error);
                        } else { Toast.error(err.error.message || err.message); }
                    } else if (err.message) { Toast.error(err.message); }
                }
                )
            );
    }

}
