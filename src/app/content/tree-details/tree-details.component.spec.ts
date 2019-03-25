import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDetailsComponent } from './tree-details.component';

describe('TreeFormComponent', () => {
  let component: TreeDetailsComponent;
  let fixture: ComponentFixture<TreeDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
