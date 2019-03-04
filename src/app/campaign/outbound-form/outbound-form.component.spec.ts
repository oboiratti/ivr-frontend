import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundFormComponent } from './outbound-form.component';

describe('OutboundFormComponent', () => {
  let component: OutboundFormComponent;
  let fixture: ComponentFixture<OutboundFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
