/*
 * File: pacakgeby-name.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package/byName endpoint for the front-end
 */

import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { PackagebyNameComponent } from './packageby-name.component';
import { ApiService } from '../api/services';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { PackageHistoryEntry } from '../api/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


describe('PackagebyNameComponent', () => {
  let component: PackagebyNameComponent;
  let fixture: ComponentFixture<PackagebyNameComponent>;
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagebyNameComponent],
      imports: [HttpClientTestingModule, FormsModule, CommonModule],
      providers: [{provide: ApiService}]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagebyNameComponent);
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
    expect(component.packageName).toEqual('');
    expect(component.packageHistory).toEqual([]);
  });

  it('should get package history successfully with 200 code', inject(
    [ApiService, HttpTestingController],
    (service: ApiService, backend: HttpTestingController) => {
      // Set up some test data
      const mockResponse: PackageHistoryEntry[] = [
        {
          Action: 'CREATE',
          Date: '2023-01-01T12:00:00Z',
          PackageMetadata: { ID: '1', Name: 'ExamplePackage', Version: '1.0.0' },
          User: { isAdmin: true, name: 'Test User' },
        },];

      // Trigger the HTTP request for getting package history
      component.getPackageHistory();  // Make sure getPackageHistory is called
  
      // Expect a single request to a specific URL with specific headers and parameters
      const req = backend.expectOne({
        url: 'http://localhost:9000/package/byName/',
        method: 'GET',
      });
  
      // Respond to the request with a mock response and status 200
      req.flush(mockResponse, { status: 200, statusText: 'OK' });
  
      // Now, check the expectations after the subscription has completed
      expect(component.packageHistory).toEqual(mockResponse);
      expect(component.packageHistory.length).toEqual(1);
  
      // Ensure there are no outstanding requests
      backend.verify();
    }
  ));

  it('should handle 404 status for non-existing package', inject(
    [ApiService],
    (service: ApiService) => {
      const mockResponse: PackageHistoryEntry[] = []; // Empty array for non-existing package

      // Trigger the HTTP request for getting package history
      component.getPackageHistory();

      // Expect a single request to a specific URL with specific headers and parameters
      const req = httpTestingController.expectOne({
        url: 'http://localhost:9000/package/byName/',
        method: 'GET',
      });

      // Respond to the request with a mock response and status 404
      req.flush(mockResponse, { status: 404, statusText: 'Not Found' });

      // Now, check the expectations after the subscription has completed
      expect(component.packageHistory).toEqual([]); // Ensure it remains an empty array or handle as needed
    }
  ));

  it('should handle 400 status for malformed query', inject(
    [ApiService],
    (service: ApiService) => {
      // Trigger the HTTP request for getting package history
      component.getPackageHistory();

      // Expect a single request to a specific URL with specific headers and parameters
      const req = httpTestingController.expectOne({
        url: 'http://localhost:9000/package/byName/',
        method: 'GET',
      });

      // Respond to the request with a mock response and status 400
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      // Package history should remain an empty array
      expect(component.packageHistory).toEqual([]);
    }
  ));

});
