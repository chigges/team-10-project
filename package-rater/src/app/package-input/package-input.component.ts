import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-package-input',
  templateUrl: './package-input.component.html',
  styleUrls: ['./package-input.component.css'],
})
export class PackageInputComponent {
  packageUrl: string = '';
  
  onSubmit() {
    // Access the user's input from this.packageUrl and take further action
    console.log('User entered URL:', this.packageUrl);
    // You can make an HTTP request to your back-end API here
  }
  
}


