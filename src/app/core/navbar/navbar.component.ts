import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IMenuItem } from 'src/app/shared/common-entities.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() authenticated: boolean
  @Input() name: string
  @Input() submenus: IMenuItem[]
  @Output() toggle = new EventEmitter()
  @Output() logout = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  doToggle() {
    this.toggle.emit()
  }

  doLogout() {
    this.logout.emit()
  }
}
