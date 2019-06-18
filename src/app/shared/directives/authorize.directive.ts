import { Directive, Input, Renderer2, ElementRef, AfterContentInit, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Directive({
  selector: '[appAuthorize]'
})
export class AuthorizeDirective implements OnInit {

  @Input() appAuthorize: string

  constructor(private renderer: Renderer2,
    private elementRef: ElementRef,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.checkPrivilege()
  }

  private checkPrivilege() {
    if (!this.authService.canAccess(this.appAuthorize)) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.elementRef.nativeElement)
    }
  }
}
