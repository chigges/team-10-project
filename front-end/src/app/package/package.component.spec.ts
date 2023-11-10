import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageComponent } from './package.component';

describe('PackageComponent', () => {
  let component: PackageComponent;
  let fixture: ComponentFixture<PackageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageComponent]
    });
    fixture = TestBed.createComponent(PackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
