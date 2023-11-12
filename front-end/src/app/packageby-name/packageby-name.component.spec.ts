import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagebyNameComponent } from './packageby-name.component';

describe('PackagebyNameComponent', () => {
  let component: PackagebyNameComponent;
  let fixture: ComponentFixture<PackagebyNameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagebyNameComponent]
    });
    fixture = TestBed.createComponent(PackagebyNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
