// aws.service.ts

import { Injectable } from '@angular/core';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

@Injectable({
  providedIn: 'root',
})
export class AwsService {
  private client: CognitoIdentityProviderClient;

  constructor() {
    // Initialize your AWS SDK client
    this.client = new CognitoIdentityProviderClient({ region: 'us-east-1' }); // Adjust the region accordingly
  }

  signUp(username: string, password: string): void {
    // Perform the signUp operation
    const params = {
      ClientId: '',
      Username: username,
      Password: password,
    };

    const command = new SignUpCommand(params);

    this.client.send(command, (err, data) => {
      if (err) {
        console.error(err, err.stack);
      } else {
        console.log(data);
      }
    });
  }

  // Add other methods as needed for your application
}
