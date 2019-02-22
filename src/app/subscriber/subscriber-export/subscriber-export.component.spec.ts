import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberExportComponent } from './subscriber-export.component';

describe('SubscriberExportComponent', () => {
  let component: SubscriberExportComponent;
  let fixture: ComponentFixture<SubscriberExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriberExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
