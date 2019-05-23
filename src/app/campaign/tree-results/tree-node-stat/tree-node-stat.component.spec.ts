import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeNodeStatComponent } from './tree-node-stat.component';

describe('TreeNodeStatComponent', () => {
  let component: TreeNodeStatComponent;
  let fixture: ComponentFixture<TreeNodeStatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeNodeStatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNodeStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
