import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { ToastrModule } from 'ngx-toastr';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { environment } from 'src/environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  imports: [
    NgxWebstorageModule.forRoot(),
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
   
    NgbModule.forRoot(),
    BsDatepickerModule.forRoot(),
  
  ],
})
export class CoreModule {}
