import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BankBranchComponent } from 'src/app/shared/modals/bank-branch/bank-branch.component';
import Swal from "sweetalert2";
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/_services/service/header.service';
import { AlertService } from '../../_services/service/alert.service';
import {BankService} from '../../_services/service//bank.service';
import {BankBranchService} from '../../_services/service//bankbranch.service';
import { BankDetails,BankBranch} from 'src/app/_services/model/Bank';
import { apiResponse } from '../../_services/model/apiResponse';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  AngularGridInstance,
  Column,
  Formatters,
  GridOption,
  OnEventArgs,
} from 'angular-slickgrid';
import * as _ from 'lodash';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit {
  bankForm: FormGroup;
  submitted = false;
  identity: any;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  datasetbranch = [];
  angularGrid: AngularGridInstance;
  gridBranch: any;
  deleteColumn: string;
  BankBranch: BankBranch = {} as any;
  BankDetails: BankDetails = {} as any;
  spinner=false;
  Id: number = 0;
  constructor(public modalService: NgbModal,public BankBranchService:BankBranchService,private activeModal: NgbActiveModal,
    public BankService:BankService,private router: Router,private headerService: HeaderService, 
    private formBuilder: FormBuilder,private alertService: AlertService,private route: ActivatedRoute, private loadingScreenService: LoadingScreenService) { }

  get f() { return this.bankForm.controls; }

  newBankBranchClick() {

    const modalRef = this.modalService.open(BankBranchComponent);
      modalRef.result.then((result) => {
             
        result.Status= result.Status == 0 ? "In-Active" : "Active";
         result.id = result.Id;
       this.angularGrid.gridService.addItem(result);
      console.log("ok",this.datasetbranch);
      
      
    }).catch((error) => {
      console.log(error);
    });
  }
  ngOnInit() {

    this.headerService.setTitle('Bank');
    this.bankForm = this.formBuilder.group({
      Id: [0],
      name: [null, Validators.required],
      code: ['', [Validators.required, Validators.minLength(3)]],
      aliasname: [null],
      uniqueValidation: [null],
      status: [true],
    })

    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);

      }
    });
    if (this.Id != 0) {
      this.do_Edit();

    }

    this.columnDefinitions = [ 
      { id: 'name', name: 'Name', field: 'Name', formatter: Formatters.uppercase, sortable: true ,filterable:true},
      { id: 'code', name: 'FinancialSystemCode', field: 'FinancialSystemCode', formatter: Formatters.uppercase,filterable:true, sortable: true },
      { id: 'location', name: 'Location', field: 'Location', sortable: true ,filterable:true},
      { id: 'Status', name: 'Status', field: 'Status', cssClass: 'right-align', sortable: true },
      {
        id: 'edit',
        field: 'id',

        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,

        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
         
          let i: any = this.datasetbranch.filter(item => item.Id == args.dataContext.Id);

          const modalRef = this.modalService.open(BankBranchComponent);
          modalRef.componentInstance.id = args.dataContext.Id;        
          modalRef.componentInstance.jsonObj = i;
          
          console.log(i);
          modalRef.result.then((result) => {
            let isSameResult = false;
           
            isSameResult = _.find(this.datasetbranch, (a) => a.Id == result.Id) != null ? true : false;
             console.log("rr",isSameResult);
            if (isSameResult) {
              result.Status =result.Status == 0 ? "In-Active" : "Active";
              this.angularGrid.gridService.updateItemById(result.Id, result);

            } else {
              this.angularGrid.gridService.addItem(result);
            }

          });
         
         // this.initial_getBranchlist_load();

        }
      },
      {
        id: 'delete',
        field: 'id',

        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              "id": args.dataContext.Id,
            }
          };
         
          this.confirmDeleteid(args.dataContext.Id, args.dataContext.code);


        }
      },
    ];
    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      enableFiltering: true,

    };
 
    //this.initial_getBranchlist_load();
  
  }
  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridBranch = angularGrid && angularGrid.slickGrid || {};

  }
  initial_getBranchlist_load(){
    this.spinner=true;   
    this.BankBranchService.getBankBranch().subscribe(response => {
      console.log(response);
      this.datasetbranch = response.dynamicObject;
     
      console.log(this.datasetbranch.length); 
      this.datasetbranch.forEach(element => {    
        element["Status"] = element.Status == 0 ? "In-Active" : "Active";
      });
      this.spinner=false;   
    }, (error) => {
      this.spinner=false;
    });
   
  }

  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {


        // this._location.back();
        this.router.navigate(['app/masters/banklist']);

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }

  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }
  delete() {
    let deletContent: BankBranch = {} as any;
    deletContent = this.datasetbranch.filter(a => a.Id == this.identity)[0];
    deletContent.Modetype = UIMode.Delete;
    this.BankBranchService.deleteBankBranch(JSON.stringify(deletContent)).subscribe(response => {
      if (response.Status) {
        this.alertService.showSuccess(response.Message);
        
        this.angularGrid.gridService.deleteItemById(this.identity);
      } else {
        this.alertService.showWarning(response.Message);
      }
      $('#modaldeleteconfimation').modal('hide');

    }, (error) => {
      $('#modaldeleteconfimation').modal('hide');
    });
  }
  
  do_Edit(){
   let req_param_uri = `Id=${this.Id}`;
    this.BankService.getBankById(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      console.log('ok',data)
      this.BankDetails = (apiResponse.dynamicObject);
     this.datasetbranch=this.BankDetails.LstBankBranch;
      this.DataBinding_for_Edit();
      this.datasetbranch.forEach(element => {    
        element["Status"] = element.Status == 0 ? "In-Active" : "Active";
      });
      
    //  this.initial_getBranchlistByBankId_load();

    },
      (err) => {
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });
  }
  DataBinding_for_Edit(): void {

    this.bankForm.controls['Id'].setValue(this.BankDetails.Id)
    this.bankForm.controls['name'].setValue(this.BankDetails.Name)
    this.bankForm.controls['code'].setValue(this.BankDetails.Code)
    this.bankForm.controls['aliasname'].setValue(this.BankDetails.AliasName)
    this.bankForm.controls['uniqueValidation'].setValue(this.BankDetails.UniqueValidation)
    this.bankForm.controls['status'].setValue(this.BankDetails.Status)

   
  }

  saveBankbutton(): void {
    this.submitted = true;
    if (this.bankForm.invalid) {
      this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }

    this.BankDetails.Id=this.bankForm.get('Id').value;
    this.BankDetails.Name=this.bankForm.get('name').value;
    this.BankDetails.Code=this.bankForm.get('code').value;
    this.BankDetails.AliasName=this.bankForm.get('aliasname').value;
    this.BankDetails.UniqueValidation=this.bankForm.get('uniqueValidation').value;
    this.BankDetails.Status=this.bankForm.get('status').value;
    this.BankDetails.Status=Boolean(this.BankDetails.Status) == false ? 0 : 1;
    this.datasetbranch.forEach(element=>{    
      element.Status =element.Status == "In-Active" ? 0 : 1;
    });
    this.BankDetails.LstBankBranch=this.datasetbranch;
    
    if (this.BankDetails.Id > 0) {
      this.BankDetails.Modetype = UIMode.Edit;}
      
      var product_request_param = JSON.stringify(this.BankDetails);
      console.log(product_request_param);
      
      this.loadingScreenService.startLoading();
    if (this.BankDetails.Id > 0) { // edit 
     
      this.BankService.putBank(product_request_param).subscribe((data: any) => {

        console.log(data);
        this.loadingScreenService.stopLoading();
        if (data.Status == true) {

          this.activeModal.close('Modal Closed');
          this.alertService.showSuccess(data.Message);

        } else {

          this.alertService.showInfo(data.Message);
        }



      },
        (err) => {
          // this.spinnerEnd();
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });

    } else {   // create
      this.BankService.postBank(product_request_param).subscribe((data: any) => {

        console.log(data);
        this.loadingScreenService.stopLoading();
        if (data.Status) {

          this.activeModal.close('Modal Closed');

          this.alertService.showSuccess(data.Message);

        } else {

          this.alertService.showInfo(data.Message);
        }

      },
        (err) => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });
    }

  }

}
