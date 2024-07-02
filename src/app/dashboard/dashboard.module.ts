import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MfasettingsComponent } from './mfasettings/mfasettings.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MfasettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule
  ],
  entryComponents: [MfasettingsComponent],
  exports: [MfasettingsComponent]
})
export class DashboardModule { }
