import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { startWith, delay, filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { RouteNames } from './shared/constants';
import { IMenuItem } from './shared/common-entities.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  menus: IMenuItem[];
  submenus: IMenuItem[];
  loading: boolean;
  isLoggedIn: boolean;
  name: string;
  @BlockUI() blockUi: NgBlockUI

  constructor(private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.checkLogin();
    this.setMenuItems();
    // this.setName()
    $('#preloader-body').hide();
  }

  checkLogin() {
    this.authService.loggedIn$.pipe(
      startWith(this.authService.isLoggedIn()),
      delay(0)
    ).subscribe(value => {
      this.isLoggedIn = value;
    });
  }

  logout() {
    this.blockUi.start('Logging Out...')
    this.authService.invalidate().subscribe((res) => {
      this.blockUi.stop()
      if (res.success) {
        this.isLoggedIn = false;
        this.authService.removeUser();
        this.router.navigate(['/login']);
      }
    }, () => this.blockUi.stop());
  }

  setName() {
    this.name = this.authService.currentUser.name;
  }

  private setMenuItems() {
    this.menus = [
      { label: 'Dashboard', route: RouteNames.dashboard, icon: 'fa fa-home fa-lg' },
      { label: 'Subscribers', route: RouteNames.subscriber, icon: 'fa fa-users fa-lg' },
      { label: 'Content', route: RouteNames.content, icon: 'fa fa-object-group fa-lg' },
      { label: 'Campaigns', route: RouteNames.campaign, icon: 'fa fa-bullhorn fa-lg' },
      { label: 'Account', route: RouteNames.admin, icon: 'fa fa-user fa-lg' },
      { label: 'Settings', route: RouteNames.appSettings, icon: 'fa fa-gear fa-lg' }
    ];
  }
}
