import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralLookupComponent } from './general-lookup.component';

describe('GeneralLookupComponent', () => {
  let component: GeneralLookupComponent;
  let fixture: ComponentFixture<GeneralLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralLookupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
