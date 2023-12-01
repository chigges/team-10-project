/*
 * File: packageby-regex.component.ts
 * Author: Madi Arnold
 * Description: The packageby-regex component for the /package/byRegEx endpoint for the front-end
 */
import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { AuthenticationToken } from '../api/models';
import { PackageRegEx } from '../api/models';
import { PackageMetadata } from '../api/models';

@Component({
  selector: 'app-packageby-regex',
  templateUrl: './packageby-regex.component.html',
  styleUrls: ['./packageby-regex.component.css']
})
export class PackagebyRegexComponent {
  authHeader: AuthenticationToken = 'YOUR_AUTH_TOKEN_HERE';
  packageregex: PackageRegEx = {
    'RegEx': ''
  };
  packages: PackageMetadata[] = [];
  noMatchesFound = false; 

  constructor(private apiService: ApiService) {}

  getPackageRegEx() {
    this.packages = [];
    this.noMatchesFound = false; 
    this.apiService.packageByRegExGet( 
      { 'X-Authorization': this.authHeader, body: this.packageregex }
    ).subscribe(
      response => {
        this.packages = response; 
        console.log('Get package regex successful', response);
      },
      error => {
        if(error.status === 404) {
          this.noMatchesFound = true; //Set flag for 404 response; 
          console.log('No matches found');
        }
        console.log('Get package regex unsuccessful', error);
      }
    )
  }
}
