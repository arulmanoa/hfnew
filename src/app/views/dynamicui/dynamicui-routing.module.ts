import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnauthorizedComponent } from 'src/app/unauthorized/unauthorized.component';
import { DynamicuiComponent } from './dynamicui/dynamicui.component';


const routes: Routes = [{
  path: '',
  children: [
   
    // { path: 'dyno', component: DynamicuiComponent, data: { breadcrumb: 'Approvals' } },
  ]
}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicuiRoutingModule { }
