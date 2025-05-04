import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { BasicGridComponent } from './components/basic-grid/basic-grid.component';
import { NgModule } from '@angular/core';
import { AboutComponent } from './components/about/about.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
export const routes: Routes = [
 { path: '', component: GridComponent },
 { path: 'basic', component: BasicGridComponent },
 {path: 'about', component: AboutComponent} ,
 {path: 'basic/about-me', component: AboutMeComponent},
 { path: '**', redirectTo: '' }
]