import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberImportComponent } from './subscriber-import.component';

describe('SubscriberImportComponent', () => {
  let component: SubscriberImportComponent;
  let fixture: ComponentFixture<SubscriberImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
