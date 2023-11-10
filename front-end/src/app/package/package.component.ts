import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { AuthenticationToken } from '../api/models';
import { PackageId } from '../api/models';
import { Package } from '../api/models'

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent {
  authHeader: AuthenticationToken = 'YOUR_AUTH_TOKEN_HERE';
  packageId: PackageId = ''; //User input for Package ID
  packageData: Package= { //User Input for Package Data
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
  updateMessage: string = '';
  deleteMessage: string = '';

  constructor(private apiService: ApiService) {}

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.readZipFile(file);
    }
  }

  readZipFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.packageData.data.Content = reader.result as string; 
    };
    reader.readAsDataURL(file);
  }

  getPackage() {
    this.apiService.packageRetrieve(
      { id: this.packageId, 'X-Authorization': this.authHeader }
    ).subscribe(
      response => {
        this.packageData = response;
        console.log('Package retrieval successful', response);
      },
      error => {
        console.log('Error retrieving package:', error);
      }
    );
  }

  updatePackage() {
    this.apiService.packageUpdate(
      { id: this.packageId, 'X-Authorization': this.authHeader, body: this.packageData }
    ).subscribe(
      response => {
        this.updateMessage = 'Package update successful';
        console.log('Package update successful:', response);
      },
      error => {
        this.updateMessage = 'Error updating pacakge';
        console.log('Error updating package:', error);
      }
    );

    setTimeout(() => {
      this.updateMessage = '';
    }, 2000);
  }

  deletePackage() {
    this.apiService.packageDelete(
      { id: this.packageId, 'X-Authorization': this.authHeader }
    ).subscribe(
      response => {
        this.deleteMessage = 'Package deletion successful';
        console.log('Package deletion successful:', response);
      },
      error => {
        this.deleteMessage = 'Error deleting package';
        console.log('Error deleting package:', error);
      }
    )

    setTimeout(() => {
      this.deleteMessage = '';
    }, 2000);
  }

}
