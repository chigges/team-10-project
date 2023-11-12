import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PackagesComponent } from './packages/packages.component';
import { ResetComponent } from './reset/reset.component';
import { PackageComponent } from './package/package.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  //{ path: '', component: PackagesComponent },
  //{ path: '', component: ResetComponent },
  //{ path: '', component: PackageComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
