import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFilterComponent } from './report-filter.component';

describe('ReportFilterComponent', () => {
  let component: ReportFilterComponent;
  let fixture: ComponentFixture<ReportFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
