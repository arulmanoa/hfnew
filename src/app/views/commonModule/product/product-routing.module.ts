import { NgModule } from '@angular/core';
import { AuthGuard, MaintenanceGuard } from 'src/app/_guards';
import { ExtraOptions, Routes, RouterModule } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
//import { RowDataService } from 'src/app/views/personalised-display/row-data.service';

import { ProductGroupComponent } from 'src/app/shared/modals/product-group/product-group.component';
import { ProductGroupListComponent } from 'src/app/views/product-group-list/product-group-list.component';
import { ProductTypeComponent } from 'src/app/shared/modals/product-type/product-type.component';
import { ProductTypeListComponent } from 'src/app/views/product-type-list/product-type-list.component';
import { ProductApplicabilityComponent } from 'src/app/shared/modals/product-applicability/product-applicability.component';
import { ProductListComponent } from 'src/app/views/product-list/product-list.component';
import { PaygroupComponent } from 'src/app/views/paygroup/paygroup.component';
import { ProductComponent } from 'src/app/views/product/product.component';

const routes: Routes = [{
  path: '',
  //canActivate: [AuthGuard],
  children: [
    //{ path: 'productgroup', component: ProductGroupComponent },
    { path: 'productgrouplist', component: ProductGroupListComponent,
      canActivate: [AuthGuard] 
    },//
    //{ path: 'producttype', component: ProductTypeComponent},
    { path: 'producttypelist', component: ProductTypeListComponent,
      canActivate: [AuthGuard] 
    },//
    { path: 'productapplicability', component: ProductApplicabilityComponent },//
    { path: 'productlist', component: ProductListComponent,
      canActivate: [AuthGuard] 
    },//
    { path: 'paygroup', component: PaygroupComponent,resolve: { DataInterface: RowDataService } },//
    { path: 'Product', component: ProductComponent, resolve: { DataInterface: RowDataService } },
  ]
}];
const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule {
  if(window) {
    window.console.log = window.console.warn = window.console.info = function () {
      // Don't log anything.
    };
  }
}
