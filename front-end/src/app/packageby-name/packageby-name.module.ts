/*
 * File: packageby-name.module.ts
 * Author: Caroline Gilbert
 * Description: Package by Name Module for the endpoint for the front-end
 */

// Import the CommonModule in your package.module.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackagebyNameComponent } from './packageby-name.component';

@NgModule({
  declarations: [PackagebyNameComponent],
  imports: [FormsModule, CommonModule], // Include CommonModule here
  exports: [PackagebyNameComponent],
})
export class PackagebyNameModule { }