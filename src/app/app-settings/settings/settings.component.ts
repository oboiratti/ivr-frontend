import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LookUps } from './settings.service';
import { RouteNames } from '../../shared/constants';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  models: any[];

  constructor(private router: Router) { }

  ngOnInit() {
    this.setModels();
  }

  gotoSetting(model) {
    if (model.route) {
       this.router.navigate([model.route]);
      } else {
        this.router.navigate([RouteNames.appSettings, RouteNames.settings, model.name]);
       }
  }

  private setModels() {
    this.models = LookUps.models;
  }
}
