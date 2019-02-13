import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { startWith, delay } from "rxjs/operators";
import { AuthService } from './auth/auth.service';
import { Route } from './shared/constants';

export interface IMenuItem {
  label: string
  route: string
  icon: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  menus: IMenuItem[];
  loading: boolean;
  isLoggedIn: boolean
  name: string

  constructor(private router: Router, 
    private authService: AuthService) { }

  ngOnInit(): void {
    this.checkLogin();
    this.setMenuItems();
    this.setName()
  }

  checkLogin() {
    this.authService.loggedIn$.pipe(
      startWith(this.authService.isLoggedIn()),
      delay(0)
    ).subscribe(value => {
      this.isLoggedIn = value
    })
  }

  logout() {
    this.loading = true;
    this.authService.invalidate().subscribe((res) => {
      this.loading = false;
      if (res.success) {
        this.isLoggedIn = false;
        this.authService.removeUser();
        this.router.navigate(['/login']);
      }
    });
  }

  setName() {
    this.name = this.authService.currentUser.name
  }

  private setMenuItems() {
    this.menus = [
      { label: "Dashboard", route: Route.dashboard, icon: "fa fa-dashboard fa-lg" },
      { label: "Settings", route: Route.settings, icon: "fa fa-cogs fa-lg" },
      { label: "Roles", route: Route.roles, icon: "fa fa-cubes fa-lg" },
      { label: "Users", route: Route.users, icon: "fa fa-users fa-lg" }
    ];
  }
}
