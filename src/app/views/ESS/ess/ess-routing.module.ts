import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EssComponent } from './ess.component';
import { ProfileComponent } from './profile/profile.component';
// import { AuthGuard, MaintenanceGuard } from './_guards';

const home1Routes = [
    {
        path: 'ess1',
        component: EssComponent,
        // children: [
        //     {
        //         path: 'pro',
        //         component: ProfileComponent
        //     }]
    }];

@NgModule({
    imports: [RouterModule.forRoot(home1Routes)

    ],
    exports: [RouterModule]
})
export class EssRoutingModule {
    if(window) {
        window.console.log = window.console.warn = window.console.info = function () {
        };
    }

}
