// registration.component.ts

import { Component } from '@angular/core';
import { AwsService } from '../aws.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  username: string = '';
  password: string = '';
  isRegistered: boolean = false;
  registrationError: string = '';

  constructor(private awsService: AwsService) {}

  async registerUser(): Promise<void> {
    try {
      // Call the signUp method from your CognitoService
      this.awsService.signUp(this.username, this.password);
      // Registration successful
      this.isRegistered = true;
      this.registrationError = ''; // Clear any previous error messages
    } catch (error) {
      // Registration failed
      console.error('Registration error', error);
      this.isRegistered = false;
      this.registrationError = 'Registration failed. Please try again.'; // Set an appropriate error message
    }
  }
}
