/*
 * File: home.component.spec.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the home endpoint for the front-end
 */

// Tests for Home Component
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ApiService } from "../api/services";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let apiService: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [HttpClientTestingModule],
      providers: [{provide: ApiService}]
    }).compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    apiService = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  // Initial Test Case: Home Component Created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
