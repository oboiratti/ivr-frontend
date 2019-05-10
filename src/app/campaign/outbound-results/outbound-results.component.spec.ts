import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundResultsComponent } from './outbound-results.component';

describe('OutboundResultsComponent', () => {
  let component: OutboundResultsComponent;
  let fixture: ComponentFixture<OutboundResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
