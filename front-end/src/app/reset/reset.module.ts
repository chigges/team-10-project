/*
 * File: reset.module.ts
 * Author: Caroline Gilbert
 * Description: Reset Module for the endpoint for the front-end
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResetComponent } from './reset.component';

@NgModule({
  declarations: [ResetComponent],
  imports: [FormsModule, CommonModule],
  exports: [ResetComponent],
})
export class ResetModule { }