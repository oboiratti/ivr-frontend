import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberFormComponent } from './subscriber-form.component';

describe('SubscriberFormComponent', () => {
  let component: SubscriberFormComponent;
  let fixture: ComponentFixture<SubscriberFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
