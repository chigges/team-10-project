/*
 * File: pacakgeby-name.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package/byRegex endpoint for the front-end
 */

import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { PackagebyRegexComponent } from './packageby-regex.component';
import { ApiService } from '../api/services';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { of, throwError } from 'rxjs';
import { PackageQuery, AuthenticationToken, EnumerateOffset, PackageMetadata, PackageHistoryEntry } from '../api/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('PackagebyRegexComponent', () => {
  let component: PackagebyRegexComponent;
  let fixture: ComponentFixture<PackagebyRegexComponent>;
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagebyRegexComponent],
      imports: [HttpClientTestingModule, FormsModule, CommonModule],
      providers: [{provide: ApiService}]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagebyRegexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    apiService = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.packageregex).toEqual({
      'RegEx': ''});
    expect(component.packages).toEqual([]);
    expect(component.noMatchesFound).toEqual(false);
  });

  // Positive Test Case: Get Packages Successfully
  it('should handle 200 response for well-formed query with valid regex', inject(
    [ApiService],
    (service: ApiService) => {
      const mockResponse: PackageMetadata[] = [
        { ID: '1', Name: '*', Version: '' },
        { ID: '2', Name: 'Underscore', Version: '' },
      ];

      // Trigger the HTTP request for packages by regex
      component.getPackageRegEx();

      // Expect a single request to a specific URL with specific headers and parameters
      const req = httpTestingController.expectOne({
        url: 'http://localhost:9000/package/byRegEx',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 200
      req.flush(mockResponse, { status: 200, statusText: 'OK' });

      // Check the expectations after the subscription has completed
      expect(component.packages).toEqual(mockResponse);
      expect(component.noMatchesFound).toEqual(false);
    }
  ));

  it('should handle 404 response for well-formed query with valid regex and no matching packages', inject(
    [ApiService],
    (service: ApiService) => {
      const mockResponse: PackageMetadata[] = []; // Empty array for no matching packages

      // Trigger the HTTP request for packages by regex
      component.getPackageRegEx();

      // Expect a single request to a specific URL with specific headers and parameters
      const req = httpTestingController.expectOne({
        url: 'http://localhost:9000/package/byRegEx',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 404
      req.flush(mockResponse, { status: 404, statusText: 'Not Found' });

      // Now, check the expectations after the subscription has completed
      expect(component.packages).toEqual([]);
      expect(component.noMatchesFound).toBeTrue();
    }
  ));

  it('should handle 404 response for well-formed query with valid regex taking more than 15 seconds', inject(
    [ApiService],
    (service: ApiService) => {
      // Set the regex to take more than 15 seconds
      component.packageregex.RegEx = 'long-running-regex';

      // Trigger the HTTP request for packages by regex
      component.getPackageRegEx();

      // Expect a single request to a specific URL with specific headers and parameters
      const req = httpTestingController.expectOne({
        url: 'http://localhost:9000/package/byRegEx',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 404
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Now, check the expectations after the subscription has completed
      expect(component.packages).toEqual([]);
      expect(component.noMatchesFound).toBeTrue();
    }
  ));

  it('should handle 400 response for malformed query missing RegEx field', inject(
    [ApiService],
    (service: ApiService) => {
      // Set the regex to an empty string to simulate a malformed query
      component.packageregex.RegEx = '';

      // Trigger the HTTP request for packages by regex
      component.getPackageRegEx();

      // Expect a single request to a specific URL with specific headers and parameters
      const req = httpTestingController.expectOne({
        url: 'http://localhost:9000/package/byRegEx',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 400
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      // Now, check the expectations after the subscription has completed
      expect(component.packages).toEqual([]);
      expect(component.noMatchesFound).toBeFalse(); // Malformed query, but noMatchesFound should be false
    }
  ));

});
