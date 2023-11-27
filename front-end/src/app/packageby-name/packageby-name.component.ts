/*
 * File: pacakgeby-name.component.ts
 * Author: Madi Arnold
 * Description: The logic for the package/byName endpoint for the front-end
 */
import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { AuthenticationToken, PackageHistoryEntry, PackageName } from '../api/models';

@Component({
  selector: 'app-packageby-name',
  templateUrl: './packageby-name.component.html',
  styleUrls: ['./packageby-name.component.css']
})
export class PackagebyNameComponent {
  authHeader: AuthenticationToken = 'YOUR_AUTH_TOKEN_HERE';
  packageName: PackageName = ''; //Input from user; 
  packageHistory: PackageHistoryEntry[] = []; //Response from the backend
  deletePackageResponse = '';

  constructor(private apiService: ApiService) {}

  getPackageHistory() {
    this.apiService.packageByNameGet(
      { 'X-Authorization': this.authHeader, name: this.packageName }
    ).subscribe(
      response => {
        this.packageHistory = response; 
        console.log('Get package history successful', response);
      },
      error => {
        console.log('Error retrieving pacakge:', error);
      }
    )
  }

  deletePackage() {
    this.apiService.packageByNameDelete(
      { 'X-Authorization': this.authHeader, name: this.packageName }
    ).subscribe(
      response => {
        this.deletePackageResponse = 'Package deletion successful';
        console.log('Delete Package was successful', response);
      },
      error => {
        this.deletePackageResponse = 'Package deletion unsuccessful';
        console.log('Delete Package was unsuccessful', error);
      }
    );

    setTimeout(() => {
      this.deletePackageResponse = '';
    }, 2000);
  }

}
