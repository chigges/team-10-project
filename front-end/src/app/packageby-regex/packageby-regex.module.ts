/*
 * File: packageby-regex.module.ts
 * Author: Caroline Gilbert
 * Description: Package by Regex for the endpoint for the front-end
 */

// Import the CommonModule in your package.module.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackagebyRegexComponent } from './packageby-regex.component';

@NgModule({
  declarations: [PackagebyRegexComponent],
  imports: [FormsModule, CommonModule], 
  exports: [PackagebyRegexComponent],
})
export class PackagebyRegexModule { }