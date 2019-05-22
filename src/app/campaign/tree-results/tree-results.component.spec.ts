import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeResultsComponent } from './tree-results.component';

describe('TreeResultsComponent', () => {
  let component: TreeResultsComponent;
  let fixture: ComponentFixture<TreeResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
