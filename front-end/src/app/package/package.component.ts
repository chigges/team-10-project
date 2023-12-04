/*
 * File: package.component.ts
 * Author: Madi Arnold
 * Description: The package component for the /package endpoint with the logic for the front-end 
 */
import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { AuthenticationToken } from '../api/models';
import { PackageId } from '../api/models';
import { Package } from '../api/models';
import { PackageData } from '../api/models';
import { PackageRating } from '../api/models';

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent {
  authHeader: AuthenticationToken = 'YOUR_AUTH_TOKEN_HERE';
  deletePackageId: PackageId = ''; //User input for deletePackage
  packageId: PackageId = ''; //User input for getPackage
  getPackageData: Package = { //Response from getPackage
    data: {
      Content: '',
      URL: '',
      JSProgram: ''
    },
    metadata: {
      Name: '',
      Version: '',
      ID: ''
    }
  };
  packageData: Package = { //User Input for updatePackage
    data: {
      Content: '',
      URL: '',
      JSProgram: ''
    },
    metadata: {
      Name: '',
      Version: '',
      ID: ''
    }
  };
  updateMessage = '';
  deleteMessage = '';
  postPackageData: PackageData = { //User Input for putPackage
    Content: '',
    URL: '',
    JSProgram: '',
  }
  postPackageDataResponse: Package = { //Response from putPackage
    data: {
      Content: '',
      URL: '',
      JSProgram: ''
    },
    metadata: {
      Name: '',
      Version: '',
      ID: ''
    }
  };
  ratePackageId: PackageId = ''; //User input for ratePacakge
  ratePackageResponse: PackageRating = {
    BusFactor: 0,
    Correctness: 0,
    GoodPinningPractice: 0,
    LicenseScore: 0,
    NetScore: 0,
    PullRequest: 0,
    RampUp: 0,
    ResponsiveMaintainer: 0
  };

  constructor(private apiService: ApiService) {}

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.readZipFile(file);
    }
  }

  handlePostFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.readPostZipFile(file);
    }
  }

  readZipFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.packageData.data.Content = reader.result as string; 
    };
    reader.readAsDataURL(file);
  }

  readPostZipFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.postPackageData.Content = reader.result as string; 
    };
    reader.readAsDataURL(file);
  }

  getPackage() {
    this.apiService.packageRetrieve(
      { id: this.packageId, 'X-Authorization': this.authHeader }
    ).subscribe(
      response => {
        this.getPackageData = response;
        console.log('Package retrieval successful', response);
      },
      error => {
        this.getPackageData = {
          data: {
            Content: '',
            URL: '',
            JSProgram: ''
          },
          metadata: {
            Name: '',
            Version: '',
            ID: ''
          }
        };
        console.log('Error retrieving package:', error);
      }
    );
  }

  updatePackage() {
    this.updateMessage = '';
    this.apiService.packageUpdate(
      { id: this.packageData.metadata.ID, 'X-Authorization': this.authHeader, body: this.packageData }
    ).subscribe(
      response => {
        this.updateMessage = 'Package update successful';
        console.log('Package update successful:', response);
      },
      error => {
        this.updateMessage = 'Error updating package';
        console.log('Error updating package:', error);
      }
    );
  }

  deletePackage() {
    this.deleteMessage = '';
    this.apiService.packageDelete(
      { id: this.deletePackageId, 'X-Authorization': this.authHeader }
    ).subscribe(
      response => {
        this.deleteMessage = 'Package deletion successful';
        console.log('Package deletion successful:', response);
      },
      error => {
        this.deleteMessage = 'Error deleting package';
        console.log('Error deleting package:', error);
      }
    );
  }

  putPackage() {
    this.apiService.packageCreate(
      { 'X-Authorization': this.authHeader, body: this.postPackageData }
    ).subscribe(
      response => {
        this.postPackageDataResponse = response;
        console.log('Package post successful:', response);
      }, 
      error => {
        console.log('Package post unsuccessful:', error);
      }
    );
  }

  ratePackage() {
    this.apiService.packageRate(
      { 'X-Authorization': this.authHeader, id: this.ratePackageId }
    ).subscribe(
      response => {
        this.ratePackageResponse = response; 
        console.log('Package rating successful', response);
      },
      error => {
        this.ratePackageResponse = {
          BusFactor: 0,
          Correctness: 0,
          GoodPinningPractice: 0,
          LicenseScore: 0,
          NetScore: 0,
          PullRequest: 0,
          RampUp: 0,
          ResponsiveMaintainer: 0
        };
        console.log('Error rating package:', error);
      }
    )
  }

  downloadZip() {
    const content = this.getPackageData.data.Content;
    // Check if content is defined before proceeding
     if (!content) {
      console.error('Content is undefined. Cannot download ZIP.');
      return;
    }
    const fileName = `${this.getPackageData.metadata.Name}-${this.getPackageData.metadata.Version}.zip`;
  
    // Convert base64 content to a Blob
    const byteCharacters = atob(content);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, { type: 'application/zip' });
  
    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  

}
