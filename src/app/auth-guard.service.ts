import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from "./auth/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkLogin(next);
    }

    private checkLogin(route: ActivatedRouteSnapshot): boolean {
        if (route.url[0].path == "login") {
            if (this.authService.isLoggedIn()) {
                this.router.navigate(['/dashboard']);
                return false;
            } else {
                return true;
            }
        }

        if (this.authService.isLoggedIn()) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}
