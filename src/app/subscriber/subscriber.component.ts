import { Component, OnInit } from '@angular/core';
import { RouteNames } from '../shared/constants';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.scss']
})
export class SubscriberComponent implements OnInit {

  submenus: any

  constructor() {}

  ngOnInit() {
    this.submenus = [
      { label: "Subscribers", route: RouteNames.subscriberList, icon: "fa fa-folder" },
      { label: "Groups", route: RouteNames.subscriberGroupList, icon: "fa fa-folder" },
      { label: "Import", route: RouteNames.subscriberImport, icon: "" },
      { label: "Export", route: RouteNames.subscriberExport, icon: "" },
      // { label: "Subscribers Properties", route: RouteNames.subscriberList, icon: "fa fa-folder" }
    ]
  }

}
