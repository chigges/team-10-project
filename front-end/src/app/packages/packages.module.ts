// packages.module.ts or the module where PackagesComponent is declared
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackagesComponent } from './packages.component';

@NgModule({
  declarations: [PackagesComponent],
  imports: [FormsModule],
})
export class PackagesModule {}
