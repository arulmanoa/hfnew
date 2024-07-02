import { Injectable } from '@angular/core';
import { appSettings } from '../model';
import { TimeCard } from '../model/Payroll/TimeCard';
import { TimeCardModel } from '../model/Payroll/TimeCardModel';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ReimbursementService {

  constructor(
    private http: HttpService,
  ) { }

  // getSomeData(): Observable<any> {
  //   if (this.someDataObservable) {
  //     return this.someDataObservable;
  //   } else {
  //     this.someDataObservable = this.http.get<any>('some/endpoint').pipe(share());
  //     return this.someDataObservable;
  //   }
  // }


  upsertTimeCards(TimeCardModels : TimeCardModel[]) {
    return this.http.post(appSettings.POST_UPSERTREIMBURSEMENTTIMECARDS , TimeCardModels)
    .share()
    .map(res => res)
    .catch(err => (err));

    // return this.http.post(appSettings.POST_UPSERTREIMBURSEMENTTIMECARDS , TimeCardModels) 
  }

  // EXPENSE MANAGEMENT

  FetchReimbursementConfigurationByEmployeeId(EmployeeId : number){
    let req_params = `${EmployeeId}`;
    return this.http.get(appSettings.GET_REIMBURSEMENTCONGIURATIONBYEMPLOYEEID + req_params)
        .map(res => res)
        .catch(err => (err));
  }

  FetchExpenseEligibilityCriteriaByEmployeeId(EmployeeId : number , ProductId : number){
    let req_params = `${EmployeeId}/${ProductId}`;
    return this.http.get(appSettings.GET_ExpenseEligibilityCriteriaByEmployeeId + req_params)
        .map(res => res)
        .catch(err => (err));
  }

  UpsertExpenseClaimRequest(data : any){
    return this.http.put(appSettings.PUT_UPSERTEXPENSECLAIMREQUEST, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  }
  UpsertExpenseBatch(data : any){
    return this.http.put(appSettings.PUT_UPSERTEXPENSEBATCH, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  }
  
  SubmitExpenseClaimRequest(data : any){
    return this.http.put(appSettings.PUT_SUBMITEXPENSECLAIMREQUEST, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  }

  SubmitExpenseBatch(data : any){
    return this.http.put(appSettings.PUT_SUBMITEXPENSEBATCH, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  }
  ValidateExpenseAmount(data : any){
    return this.http.put(appSettings.PUT_VALIDATEEXPENSEAMOUNT, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  }
  MigrateExpense(data : any){
    return this.http.put(appSettings.PUT_MIGRATEEXPENSE, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  }

  CreateExpensePayoutBatch(data : any){
    return this.http.post(appSettings.PUT_CREATEEXPENSEPAYOUTBATCH, data)
    .map(res => res)
    .catch(
        err => (err)
    );
  } 
  
}
