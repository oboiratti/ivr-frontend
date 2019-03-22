import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeStudioComponent } from './tree-studio.component';

describe('TreeStudioComponent', () => {
  let component: TreeStudioComponent;
  let fixture: ComponentFixture<TreeStudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeStudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
