import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeNodeResponseComponent } from './tree-node-response.component';

describe('TreeNodeResponseComponent', () => {
  let component: TreeNodeResponseComponent;
  let fixture: ComponentFixture<TreeNodeResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeNodeResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNodeResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
