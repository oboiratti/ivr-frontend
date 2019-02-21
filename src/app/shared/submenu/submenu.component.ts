import { Component, OnInit, Input } from '@angular/core';
import { IMenuItem } from '../common-entities.model';

@Component({
  selector: 'submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.scss']
})
export class SubmenuComponent implements OnInit {

  @Input() items: IMenuItem[]

  constructor() { }

  ngOnInit() {
  }

}
