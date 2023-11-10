import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './api/services';
import { PackagesComponent } from './packages/packages.component';
import { ResetComponent } from './reset/reset.component';
import { PackageComponent } from './package/package.component';

@NgModule({
  declarations: [
    AppComponent,
    PackagesComponent,
    ResetComponent,
    PackageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers:  [
    ApiService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
