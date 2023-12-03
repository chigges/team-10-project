/*
 * File: packages.module.ts
 * Author: Caroline Gilbert
 * Description: Package Module for the endpoint for the front-end
 */

// Import the CommonModule in your package.module.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackagesComponent } from './packages.component';

@NgModule({
  declarations: [PackagesComponent],
  imports: [FormsModule, CommonModule],
  exports: [PackagesComponent],
})
export class PackagesModule { }
