import { Component, OnInit } from '@angular/core';
import { RouteNames } from '../shared/constants';

@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit {

  submenus: any

  constructor() { }

  ngOnInit() {
    this.submenus = [
      { label: "Settings", route: RouteNames.settings, icon: "" },
      // { label: "Credit Transactions", route: RouteNames.subscriberGroupList, icon: "" }
    ]
  }

}
