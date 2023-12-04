/*
 * File: packages.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the packages endpoint for the front-end
 */
import { TestBed, ComponentFixture, inject } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { of } from 'rxjs';
import { PackagesComponent } from './packages.component';
import { ApiService } from "../api/services";
import { PackageMetadata } from '../api/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('PackagesComponent', () => {
  let component: PackagesComponent;
  let fixture: ComponentFixture<PackagesComponent>;
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagesComponent],
      imports: [HttpClientTestingModule, FormsModule, CommonModule],
      providers: [{provide: ApiService}]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    apiService = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  // Initial Test Case: Packages Component Created
  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.packageName).toEqual('');
    expect(component.packageVersion).toEqual('');
    expect(component.packages).toEqual([]);
  });

  // Positive Test Case: Get Packages Successfully
  it('should handle well-formed API query to /packages with a valid name and version search', () => {
    const mockResponse: PackageMetadata[] = [
      { ID: '', Name: 'Package1', Version: '1.0.0' },
      { ID: '', Name: 'Package2', Version: '2.0.0' },
    ];
    spyOn(apiService, 'packagesList').and.returnValue(of(mockResponse));

    component.packageName = 'Package1';
    component.packageVersion = '1.0.0';
    component.onSubmit();

    expect(apiService.packagesList).toHaveBeenCalledWith({
      'X-Authorization': component.authHeader,
      offset: '',
      body: [{ Name: 'Package1', Version: '1.0.0' }],
    });
    expect(component.packages).toEqual(mockResponse);
    expect(component.packages.length).toEqual(2);
    expect(component.packages[0].Name).toEqual('Package1');
    expect(component.packages[0].Version).toEqual('1.0.0');
    expect(component.packages[1].Name).toEqual('Package2');
    expect(component.packages[1].Version).toEqual('2.0.0');
    
  });

  it('should expect HTTP response to be 200 for well-formed query', inject(
    [ApiService, HttpTestingController],
    (service: ApiService, backend: HttpTestingController) => {
      const mockResponse: Array<PackageMetadata> = [
        { ID: '', Name: 'Package1', Version: '1.0.0' },
        { ID: '', Name: 'Package2', Version: '2.0.0' },
      ];

      // Trigger the HTTP request
      service.packagesList({ 
        'X-Authorization': component.authHeader, 
        offset: '', 
        body: [{ Name: 'Package1', Version: '1.0.0' }] 
      }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Expect a single request to a specific URL
      const req = backend.expectOne({
        url: 'http://localhost:9000/packages?offset=',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 200
      req.flush(mockResponse, { status: 200, statusText: 'OK' });

      // Ensure there are no outstanding requests
      backend.verify();
    }
  ));

  it('should expect HTTP response to be 200 for well-formed query with *', inject(
    [ApiService, HttpTestingController],
    (service: ApiService, backend: HttpTestingController) => {
      const mockResponse: Array<PackageMetadata> = [
        { ID: '', Name: '*', Version: '' },
      ];

      // Trigger the HTTP request
      service.packagesList({ 
        'X-Authorization': component.authHeader, 
        offset: '', 
        body: [{ Name: '*', Version: '' }] 
      }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Expect a single request to a specific URL
      const req = backend.expectOne({
        url: 'http://localhost:9000/packages?offset=',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 200
      req.flush(mockResponse, { status: 200, statusText: 'OK' });

      // Ensure there are no outstanding requests
      backend.verify();
    }
  ));

  it('should expect HTTP response to be 200 for n-th package offset', inject(
    [ApiService, HttpTestingController],
    (service: ApiService, backend: HttpTestingController) => {
      const mockResponse: Array<PackageMetadata> = [
        { ID: '', Name: '*', Version: '' },
      ];

      // Trigger the HTTP request
      service.packagesList({ 
        'X-Authorization': component.authHeader, 
        offset: '2', 
        body: [{ Name: '*', Version: '' }] 
      }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Expect a single request to a specific URL
      const req = backend.expectOne({
        url: 'http://localhost:9000/packages?offset=2',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 200
      req.flush(mockResponse, { status: 200, statusText: 'OK' });

      // Ensure there are no outstanding requests
      backend.verify();
    }
  ));


  it('should handle malformed query and respond with 400 status code', inject(
    [ApiService, HttpTestingController],
    (service: ApiService, backend: HttpTestingController) => {
      // Trigger the HTTP request with a malformed query
      service.packagesList({
        'X-Authorization': component.authHeader,
        offset: '',
        // Missing PackageQuery field in the body
        body: [],
      }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'),

        // The error callback should be invoked with a 400 response
        (error) => {
          expect(error.status).toEqual(400);
          expect(error.statusText).toEqual('Bad Request');
        }
      );

      // Expect a single request to a specific URL with specific headers and body
      const req = backend.expectOne({
        url: 'http://localhost:9000/packages?offset=',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 400
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      // Ensure there are no outstanding requests
      backend.verify();
    }
  ));

  it('should handle too many packages and respond with 413 status code', inject(
    [ApiService, HttpTestingController],
    (service: ApiService, backend: HttpTestingController) => {
      // Trigger the HTTP request with a query that will return too many packages
      service.packagesList({
        'X-Authorization': component.authHeader,
        offset: '',
        body: [{ Name: 'ValidPackage', Version: '1.0.0' }],
      }).subscribe(
        // The success callback should not be invoked for this test
        () => fail('Should not have succeeded'),

        // The error callback should be invoked with a 413 response
        (error) => {
          expect(error.status).toEqual(413);
          expect(error.statusText).toEqual('Request Entity Too Large');
        }
      );

      // Expect a single request to a specific URL with specific headers and body
      const req = backend.expectOne({
        url: 'http://localhost:9000/packages?offset=',
        method: 'POST',
      });

      // Respond to the request with a mock response and status 413
      req.flush('Request Entity Too Large', { status: 413, statusText: 'Request Entity Too Large' });

      // Ensure there are no outstanding requests
      backend.verify();
    }
  ));

});
