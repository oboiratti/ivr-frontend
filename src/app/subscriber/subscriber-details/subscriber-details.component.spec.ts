import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberDetailsComponent } from './subscriber-details.component';

describe('SubscriberDetailsComponent', () => {
  let component: SubscriberDetailsComponent;
  let fixture: ComponentFixture<SubscriberDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
