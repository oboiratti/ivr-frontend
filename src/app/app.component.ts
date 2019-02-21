import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { startWith, delay, filter } from "rxjs/operators";
import { AuthService } from './auth/auth.service';
import { RouteNames } from './shared/constants';
import { IMenuItem } from './shared/common-entities.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  menus: IMenuItem[];
  submenus: IMenuItem[];
  loading: boolean;
  isLoggedIn: boolean
  name: string

  constructor(private router: Router, 
    private authService: AuthService) { }

  ngOnInit(): void {
    this.checkLogin();
    this.setMenuItems();
    //this.setName()
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
      { label: "Dashboard", route: RouteNames.dashboard, icon: "fa fa-home fa-lg" },
      { label: "Subscribers", route: RouteNames.subscriber, icon: "fa fa-users fa-lg" },
      { label: "Content", route: RouteNames.roles, icon: "fa fa-object-group fa-lg" },
      { label: "Campaigns", route: RouteNames.roles, icon: "fa fa-bullhorn fa-lg" },
      { label: "Account", route: RouteNames.profile, icon: "fa fa-user fa-lg" },
      { label: "Help", route: RouteNames.users, icon: "fa fa-question-circle-o fa-lg" }
    ];
  }
}
