import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { BasicGridComponent } from './components/basic-grid/basic-grid.component';
import { NgModule } from '@angular/core';
export const routes: Routes = [
 { path: '', component: GridComponent },
 { path: 'basic', component: BasicGridComponent },
  { path: '**', redirectTo: '' } ]// Redirect any unmatched routes to home