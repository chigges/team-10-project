import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { PackageQuery } from '../api/models';
import { AuthenticationToken } from '../api/models';
import { EnumerateOffset } from '../api/models';
import { PackageMetadata } from '../api/models';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css']
})
export class PackagesComponent {
  packages: PackageMetadata[] = []; 
  authHeader: AuthenticationToken = 'YOUR_AUTH_TOKEN_HERE';
  packageName: string = ''; //User input for Package Name
  packageVersion: string = ''; //User input for Package Version

  constructor(private apiService: ApiService) {}

  onSubmit() {
    const query: PackageQuery = {
      Name: this.packageName,
      Version: this.packageVersion,
    };
    console.log('package name: %s', query.Name);
    const offset: EnumerateOffset = '';

    this.apiService.packagesList(
      { 'X-Authorization': this.authHeader, offset, body: [query] }
    ).subscribe((data: PackageMetadata[]) => {
      this.packages = data; 
    });
  }
}
