import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagebyRegexComponent } from './packageby-regex.component';

describe('PackagebyRegexComponent', () => {
  let component: PackagebyRegexComponent;
  let fixture: ComponentFixture<PackagebyRegexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagebyRegexComponent]
    });
    fixture = TestBed.createComponent(PackagebyRegexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
