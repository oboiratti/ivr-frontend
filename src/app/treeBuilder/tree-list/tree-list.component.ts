import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { RouteNames } from "../../shared/constants";
import { routerNgProbeToken } from '@angular/router/src/router_module';

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.scss']
})
export class TreeListComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  openStudio(){
    this.router.navigate([RouteNames.treeStudio])
  }

}
