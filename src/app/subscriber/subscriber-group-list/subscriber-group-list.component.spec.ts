import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberGroupListComponent } from './subscriber-group-list.component';

describe('SubscriberGroupListComponent', () => {
  let component: SubscriberGroupListComponent;
  let fixture: ComponentFixture<SubscriberGroupListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberGroupListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
