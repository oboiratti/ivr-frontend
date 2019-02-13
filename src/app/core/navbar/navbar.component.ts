import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() authenticated: boolean
  @Input() name: string
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
