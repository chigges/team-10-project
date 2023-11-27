import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PackagesComponent } from './packages/packages.component';
import { ResetComponent } from './reset/reset.component';
import { PackageComponent } from './package/package.component';
import { HomeComponent } from './home/home.component';
import { RegistrationComponent } from './registration/registration.component';
import { PackagebyRegexComponent } from './packageby-regex/packageby-regex.component';

const routes: Routes = [];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
