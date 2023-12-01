/*
 * File: reset.component.ts
 * Author: Madi Arnold
 * Description: The component for the /reset endpoint for the front-end 
 */
import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { AuthenticationToken } from '../api/models';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {
  resetMessage = '';
  authHeader: AuthenticationToken = 'YOUR_AUTH_TOKEN_HERE';

  constructor(private apiService: ApiService) {}



  onSubmit() {
    this.apiService.registryReset(
      { 'X-Authorization': this.authHeader }
    ).subscribe(
      response => {
        // Handle the reset response as needed
        this.resetMessage = 'Application reset successful.';
        console.log('Application reset successful:', response);
        
      },
      error => {
        // Handle reset error
        this.resetMessage = 'Error reseting application.';
        console.error('Error resetting application:', error);
      }
    )

    setTimeout(() => {
      this.resetMessage = '';
    }, 2000);
  }

}
