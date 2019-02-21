import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberGroupFormComponent } from './subscriber-group-form.component';

describe('SubscriberGroupFormComponent', () => {
  let component: SubscriberGroupFormComponent;
  let fixture: ComponentFixture<SubscriberGroupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberGroupFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
