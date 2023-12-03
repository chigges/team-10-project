/*
 * File: package.module.ts
 * Author: Caroline Gilbert
 * Description: Unit tests for the package/byName endpoint for the front-end
 */

// Import the CommonModule in your package.module.ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackageComponent } from './package.component';
import { FilterOutContentFieldPipe } from '../filter-out-content.pipe';

@NgModule({
  declarations: [PackageComponent, FilterOutContentFieldPipe],
  imports: [FormsModule, CommonModule], 
  exports: [PackageComponent],
})
export class PackageModule { }

  