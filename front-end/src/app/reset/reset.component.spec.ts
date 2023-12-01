/*
 * File: reset.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the reset endpoint for the front-end
 */
import { TestBed, ComponentFixture } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { of, throwError } from 'rxjs';
import { ResetComponent } from './reset.component';
import { ApiService } from "../api/services";
import { StrictHttpResponse } from '../api/strict-http-response';
import { HttpResponse } from '@angular/common/http';

describe('ResetComponent', () => {
  let component: ResetComponent;
  let fixture: ComponentFixture<ResetComponent>;
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResetComponent],
      imports: [HttpClientTestingModule],
      providers: [{provide: ApiService}]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    apiService = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  }); 

  // Initial Test Case: Reset Component Created
  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.resetMessage).toEqual('');
  });

  // Positive Test Case: Reset System Successfully
  it('should reset application on valid query', () => {
    const mockResponse: StrictHttpResponse<void> = {
      status: 200,
      body: null as any,
      type: 4,
      clone: null as any,
      headers: null as any,
      statusText: 'OK',
      url: 'localhost:9000/reset',
      ok: true
    };

    spyOn(apiService, 'registryReset$Response').and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(apiService.registryReset$Response).toHaveBeenCalled();
    expect(apiService.registryReset$Response).toHaveBeenCalledWith({ 'X-Authorization': component.authHeader }, undefined);
    expect(component.resetMessage).toEqual('Application reset successful.');
  });

  // Negative Test Case: Reset System Unsuccessfully
  it('should not reset application on invalid query', () => {
    const mockErrorResponse: StrictHttpResponse<void> = {
      status: 400,
      body: null as any,
      type: 4,
      clone: null as any,
      headers: null as any,
      statusText: 'Bad Request',
      url: 'localhost:9000/reset',
      ok: false
    };

    spyOn(apiService, 'registryReset$Response').and.returnValue(throwError({ error: mockErrorResponse }));

    component.onSubmit();

    expect(apiService.registryReset$Response).toHaveBeenCalled();
    expect(apiService.registryReset$Response).toHaveBeenCalledWith({ 'X-Authorization': component.authHeader }, undefined);
    expect(component.resetMessage).toEqual('Error reseting application.');
  });


  //
  // Redundant tests to ensure 100% coverage and try different ways to test
  //
  it('should call apiService.registryReset on submit', () => {
    spyOn(apiService, 'registryReset').and.returnValue(of()); 
    component.onSubmit();
    expect(apiService.registryReset).toHaveBeenCalledWith({ 'X-Authorization': component.authHeader });
  });
  

  it("should handle well-formed API query to /reset with 200 response", () => {
    // Arrange
    const responseMock: StrictHttpResponse<void> = {
      status: 200,
      body: null as any,
      type: null as any,
      clone: null as any,
      headers: null as any,
      statusText: null as any,
      url: null as any,
      ok: true
    };

    // Spy on the actual method
    spyOn(apiService, 'registryReset$Response').and.returnValue(of(responseMock));

    // Act
    component.onSubmit();

    // Assert
    expect(apiService.registryReset$Response).toHaveBeenCalled();
    expect(component.resetMessage).toEqual('Application reset successful.');
  });

  it('Should handle well-formed API query', () => {
    const expectedResponse: HttpResponse<void> = {
      headers: null as any,
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:9000/reset',
      ok: true,
      type: 4,
      body: null as any,
      clone: null as any
    };

    apiService.registryReset$Response({ 'X-Authorization': component.authHeader }).subscribe((response: StrictHttpResponse<void>) => {
      // console.log('expectedResponse: ', expectedResponse);
      expect(response.status).toEqual(expectedResponse.status);
    });

    const req = httpTestingController.expectOne('http://localhost:9000/reset');
    req.flush(expectedResponse);
  });


  it('Should handle mal-formed API query', () => {
    
    component.onSubmit();

    const req = httpTestingController.expectOne('http://localhost:9000/reset');
    req.flush(null, { status: 400, statusText: 'Bad Request' });
    expect(component.resetMessage).toEqual('Error reseting application.');
    console.log('component.resetMessage: ', component.resetMessage);

  });

  it('Should handle API query with no auth header', () => {
    component.authHeader = '';
    component.onSubmit();

    const req = httpTestingController.expectOne('http://localhost:9000/reset');
    req.flush(null, { status: 400, statusText: 'Unauthorized' });
    expect(component.resetMessage).toEqual('Error reseting application.');
    console.log('component.resetMessage for no auth: ', component.resetMessage);
  });

  it('Should handle API with correct auth header', () => {
    component.authHeader = 'X-Authorization';
    component.onSubmit();

    const req = httpTestingController.expectOne('http://localhost:9000/reset');
    req.flush(null, { status: 200, statusText: 'OK' });
    expect(component.resetMessage).toEqual('Application reset successful.');
    console.log('component.resetMessage for correct auth: ', component.resetMessage);
  });

  });
  
