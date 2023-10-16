import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageInputComponent } from './package-input.component';

describe('PackageInputComponent', () => {
  let component: PackageInputComponent;
  let fixture: ComponentFixture<PackageInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageInputComponent]
    });
    fixture = TestBed.createComponent(PackageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
