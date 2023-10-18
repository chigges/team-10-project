import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageResultsComponent } from './package-results.component';

describe('PackageResultsComponent', () => {
  let component: PackageResultsComponent;
  let fixture: ComponentFixture<PackageResultsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageResultsComponent]
    });
    fixture = TestBed.createComponent(PackageResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
