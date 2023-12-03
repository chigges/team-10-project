import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './api/services';
import { PackagesComponent } from './packages/packages.component';
import { ResetComponent } from './reset/reset.component';
import { PackageComponent } from './package/package.component';
import { HomeComponent } from './home/home.component';
import { PackagebyNameComponent } from './packageby-name/packageby-name.component';
import { PackagebyRegexComponent } from './packageby-regex/packageby-regex.component';
import { FilterOutContentFieldPipe } from './filter-out-content.pipe';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    PackagesComponent,
    ResetComponent,
    PackageComponent,
    HomeComponent,
    PackagebyNameComponent,
    PackagebyRegexComponent,
    FilterOutContentFieldPipe ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  providers:  [
    ApiService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
