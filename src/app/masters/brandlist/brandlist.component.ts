import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 
import { ToastrService } from 'ngx-toastr';
import { UsernameValidator } from '../../_validators/username';
import { BrandService } from '../../_services/service/brand.service';
// import { Brand } from '../../_services/model';
// import { AuthorizationGuard } from '../../_guards/Authorizationguard'
// import { process, State } from '@progress/kendo-data-query';
// import { GridDataResult, DataStateChangeEvent, PageChangeEvent } from '@progress/kendo-angular-grid';
// import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
@Component({
  selector: 'app-brandlist',
  templateUrl: './brandlist.component.html',
  styleUrls: ['./brandlist.component.css']
})
export class BrandlistComponent implements OnInit {
 
  // objBrand: Brand = {} as any;
  // brandForm: FormGroup;
  // panelTitle: string;
  // action: boolean;
  // identity: number = 0;
  // deleteColumn: string;
  // dtOptions: DataTables.Settings = {};
  // SearchBy: string = '';
  // SearchKeyword: string = '';
  // Searchaction: boolean = true;
  constructor(
    // private alertService: ToastrService,
    // private _usernameValidator: UsernameValidator,
    // private _uomService: BrandService,
    // private _spinner: NgxSpinnerService,
    // private _authorizationGuard: AuthorizationGuard,
    // private fb: FormBuilder,
  ) { }

  // //#region Validation Start
  // formErrors = {
  //   'BrandName': '',
  // };

  // // This object contains all the validation messages for this form
  // validationMessages = {
  //   'BrandName': {
  //     'required': 'This Field is required.',
  //     'BrandInUse': 'This Brand is already registered!'
  //   },
  // };

  // logValidationErrors(group: FormGroup = this.brandForm): void {
  //   Object.keys(group.controls).forEach((key: string) => {
  //     const abstractControl = group.get(key);
  //     // if (abstractControl && abstractControl.value && abstractControl.value.length > 0 && !abstractControl.value.replace(/^\s+|\s+$/gm, '').length) {
  //     //   abstractControl.setValue('');
  //     // }
  //     this.formErrors[key] = '';
  //     if (abstractControl && !abstractControl.valid &&
  //       (abstractControl.touched || abstractControl.dirty)) {
  //       const messages = this.validationMessages[key];
  //       for (const errorKey in abstractControl.errors) {
  //         if (errorKey) {
  //           this.formErrors[key] += messages[errorKey] + ' ';
  //         }
  //       }
  //     }
  //     if (abstractControl instanceof FormGroup) {
  //       this.logValidationErrors(abstractControl);
  //     }
  //   });
  // }
  // //#endregion Validation End


  ngOnInit() { 
  } 
}
