import { Component } from '@angular/core';
import { ApiService } from '../api/services';
import { PackageComponent } from '../package/package.component'; 

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private apiService: ApiService) {}
}
