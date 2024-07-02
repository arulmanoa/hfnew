import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvestmentComponent } from './investment/investment.component';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { AuthGuard } from 'src/app/_guards';
import { InvestmentVerificationComponent } from './investment-verification/investment-verification.component';
import { TaxcalculatorComponent } from './taxcalculator/taxcalculator.component';

const routes: Routes = [
  {
    path: '',
    children: [
       { path: 'myinvestment', 
       component: InvestmentComponent, 
       data: { title: 'My Investment', breadcrumb: 'My Investment' } ,
       resolve: { DataInterface: RowDataService },
       
    },
    { path: 'investmentVerification', 
       component: InvestmentVerificationComponent, 
       data: { title: 'Investment Verification', breadcrumb: 'Investment Verification' } ,
      //  resolve: { DataInterface: RowDataService },
       
    },
    // { path: 'taxCalculator', 
    //    component: TaxcalculatorComponent, 
    //    data: { title: 'Tax Calculator', breadcrumb: 'Tax Calculator' } ,       
    // }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvestmentRoutingModule { }
