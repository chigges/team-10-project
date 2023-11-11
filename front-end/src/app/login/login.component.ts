import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api/services';
import { AuthenticationRequest } from '../api/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router, private apiService: ApiService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log("yes");
      console.log(this.loginForm.value.username);
      console.log(this.loginForm.value.password);
      const userCredentials: AuthenticationRequest = {
        User: {
          name: this.loginForm.value.username,
          isAdmin: false, // Set isAdmin based on your requirements
        },
        Secret: {
          password: this.loginForm.value.password,
        },
      };

      this.apiService.createAuthToken(
        { body: userCredentials }).subscribe(
        (response) => {
          // Handle successful authentication 
          this.router.navigate(['/home']);
          console.log('Authentication successful', response);
        },
        (error) => {
          // Handle authentication error
          console.error('Authentication failed', error);
        }
      );
    }
  }

}
