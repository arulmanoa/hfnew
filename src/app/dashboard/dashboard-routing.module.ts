import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
//   {
//     path: '',
//     children: [
//       {
//         path: 'dashboard',
//         pathMatch: 'full',
//         component: DashboardComponent
//       },
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//     ]
//   }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
