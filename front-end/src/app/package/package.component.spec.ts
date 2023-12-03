/*
 * File: pacakge.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package endpoint for the front-end
 */

import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { PackageComponent } from './package.component';
import { ApiService } from '../api/services';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { of, throwError } from 'rxjs';
import { PackageQuery, AuthenticationToken, EnumerateOffset, PackageMetadata, PackageHistoryEntry } from '../api/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
