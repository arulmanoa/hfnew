import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PrivatelayoutComponent } from './privatelayout.component';

@NgModule({
  declarations: [
    PrivatelayoutComponent
  
   ],
  imports: [
    CommonModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  
  ],
  entryComponents: [
  ]
})
export class PrivateLayoutModule { }
