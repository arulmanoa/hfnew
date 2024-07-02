import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable({
    providedIn: 'root'
})
export class SharedDataService {
    constructor() { }
    public empTransferObject = new BehaviorSubject({
        ActionMenuName: "",
        EmployeeId: 0,
        EmployeeRateSet: null,
        ReDirectURL: null,
    })
    //Using any
    public editDataDetails: any = [];
    public subject = new Subject<any>();
    private messageSource = new BehaviorSubject(this.editDataDetails);
    currentMessage = this.messageSource.asObservable();
    changeMessage(message: string) {
        this.messageSource.next(message)
    }
    SetEmployeeObjecct(empTransferObject) {

        this.empTransferObject.next(empTransferObject);
    }


}