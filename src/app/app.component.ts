import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { startWith, delay, filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { RouteNames } from './shared/constants';
import { IMenuItem } from './shared/common-entities.model';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Chart } from 'chart.js'

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
    this.chartPlugin()
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

  private chartPlugin() {
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.elements.center) {
          // Get ctx from string
          const ctx = chart.chart.ctx;

          // Get options from the center object in options
          const centerConfig = chart.config.options.elements.center;
          const fontStyle = centerConfig.fontStyle || 'Arial';
          const txt = centerConfig.text;
          const color = centerConfig.color || '#000';
          const sidePadding = centerConfig.sidePadding || 20;
          const sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
          // Start with a base font of 30px
          ctx.font = '30px ' + fontStyle;

          // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
          const stringWidth = ctx.measureText(txt).width;
          const elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

          // Find out how much the font can grow in width.
          const widthRatio = elementWidth / stringWidth;
          const newFontSize = Math.floor(15 * widthRatio);
          const elementHeight = (chart.innerRadius * 2);

          // Pick a new font size so it will not be larger than the height of label.
          const fontSizeToUse = Math.min(newFontSize, elementHeight);

          // Set font settings to draw it correctly.
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
          ctx.font = fontSizeToUse + 'px ' + fontStyle;
          ctx.fillStyle = color;

          // Draw text in center
          ctx.fillText(txt, centerX, centerY);
        }
      }
    });
  }

  private setMenuItems() {
    this.menus = [
      { label: 'Dashboard', route: RouteNames.dashboard, icon: 'fa fa-home fa-lg' },
      { label: 'Subscribers', route: RouteNames.subscriber, icon: 'fa fa-users fa-lg' },
      { label: 'Content', route: RouteNames.content, icon: 'fa fa-object-group fa-lg' },
      { label: 'Campaigns', route: RouteNames.campaign, icon: 'fa fa-bullhorn fa-lg' },
      { label: 'Account', route: RouteNames.admin, icon: 'fa fa-user fa-lg' },
      { label: 'Settings', route: RouteNames.appSettings, icon: 'fa fa-gear fa-lg' },
      { label: 'Reports', route: RouteNames.reports, icon: 'fa fa-file-text fa-lg' }
    ];
  }
}
