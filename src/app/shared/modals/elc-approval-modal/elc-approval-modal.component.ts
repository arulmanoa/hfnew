import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { AlertService, FileUploadService, SessionStorage } from 'src/app/_services/service';
import Swal from 'sweetalert2';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
@Component({
  selector: 'app-elc-approval-modal',
  templateUrl: './elc-approval-modal.component.html',
  styleUrls: ['./elc-approval-modal.component.css']
})
export class ElcApprovalModalComponent implements OnInit {

  // @Input() Id : Number;
  @Input() UserId: number;
  @Input() clientApprovalObj: any;
  @Input() LstClientApproval : any;
  @Input() employeeDetails : any;

  approvalForm: FormGroup;
  FileName : string;

  disableBtn : boolean = true;
  isLoading: boolean = false;
  spinnerText: string = "Uploading";
  submitted : boolean = false;

  _loginSessionDetails: LoginResponses;
  BusinessType : number;

  approvalForList = [
    {
      label : 'Minimum Wages NonAdherence',
      value : 3,
    },
    {
      label : 'ELC',
      value : 6,
    },
    {
      label : 'Others',
      value : 5,
    }
  ]

  approvalTypeList = [
    {
      label : 'Internal',
      value : 1,
    },
    {
      label : 'External',
      value : 2,
    },
  ]

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private fileuploadService : FileUploadService,
    private alertService : AlertService,
    private sessionService: SessionStorage
  ) {
    this.createForm();
   }

  get g(){
    return this.approvalForm.controls;
  }
   
  createForm() {

    this.approvalForm = this.formBuilder.group({
      Id: [0],
      Idx : [0],
      EntityType : [EntityType.EmployeeLifeCycleTransaction],
      EntityId : [0],
      DocumentApprovalFor: [null, Validators.required],
      DocumentApprovalType: [null, Validators.required],
      DocumentName: ['', Validators.required],
      ObjectStorageId: ['', Validators.required],
      RefrenceObject : [''],
      Remarks: [''],
      SystemRemarks : [''],
      Status: [1],
      ModeType : [UIMode.Edit],
      IsApproved: [true],
      IsDocumentDelete: [false], // extra prop
      IsChanged : [false], //extra prop
      ApprovalForName : [''],
      ApprovalTypeName : [''],
    });
  }

  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

    if (this.clientApprovalObj != undefined && this.clientApprovalObj != null) {

      // this.popupId = this.jsonObj.Id;
      // this.firstTimeDocumentId = this.jsonObj.ObjectStorageId;
      this.FileName = this.clientApprovalObj.DocumentName; 

      this.approvalForm.patchValue(this.clientApprovalObj);
            
    }

    this.approvalForm.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = false;
      });
  }


  onFileUpload(e) {

    // this.approvalForm.get('ObjectStorageId').valid;

    this.isLoading = true;
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      // const pattern = /image-*/;
      // var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      // var maxSize = (Math.round(size / 1024) + " KB");
      // console.log("Size :: " , maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = false;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";
        this.FileName = file.name;
        this.approvalForm.controls['DocumentName'].setValue(file.name);
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, this.FileName)

      };

    }
  }

  doAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;

      this.employeeDetails.hasOwnProperty("EmployeeId") == true ? 
      objStorage.EmployeeId =  this.employeeDetails.EmployeeId :  objStorage.EmployeeId = this.employeeDetails.CandidateId ;      objStorage.ClientContractCode =  this.BusinessType == 3 ? "" :this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? ""  : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.employeeDetails.ClientContractId;
      objStorage.ClientId = this.employeeDetails.ClientId;
      objStorage.CompanyId = this.employeeDetails.CompanyId;

      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "EmpTransactions";

      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.approvalForm.controls['ObjectStorageId'].setValue(apiResult.Result);
            this.approvalForm.controls['IsDocumentDelete'].setValue(false);
            // this.unsavedDocumentLst.push({
            //   Id: apiResult.Result
            // })
            this.isLoading = false;
            this.alertService.showSuccess("You have successfully uploaded this file")

          }
          else {
            this.FileName = null;
            this.approvalForm.controls['DocumentName'].setValue(null);
            this.isLoading = false;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.FileName = null;
          this.approvalForm.controls['DocumentName'].setValue(null);
          this.isLoading = false;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.approvalForm.controls['DocumentName'].setValue(null);
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = false;
    }

  }

  doDeleteFile() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "This item will be deleted immediately. You can't undo this file.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {
    
    if (this.approvalForm.get('ObjectStorageId').value !== 0) {

      this.deleteAsync();
    }
    // else if (this.firstTimeDocumentId != this.approvalForm.get('ObjectStorageId').value) {
     
      
    //   this.deleteAsync();

    // }

    else {
      this.FileName = null;
      this.approvalForm.controls['IsDocumentDelete'].setValue(true);
      this.approvalForm.controls['DocumentName'].setValue(null);

    }
  } else if (result.dismiss === Swal.DismissReason.cancel) {

    swalWithBootstrapButtons.fire(
      'Cancelled',
      'Your request has been cancelled',
      'error'
    )
  }
})

  }

  deleteAsync() {

  
        this.isLoading = true;
        this.spinnerText = "Deleting";


        this.fileuploadService.deleteObjectStorage((this.approvalForm.get('ObjectStorageId').value)).subscribe((res) => {
          console.log(res);
          let apiResult  = (res);
          try {
            if (apiResult.Status) {

              //search for the index.
              // var index = this.unsavedDocumentLst.map(function (el) {
              //   return el.Id
              // }).indexOf(this.approvalForm.get('ObjectStorageId').value)

              // Delete  the item by index.
              // this.unsavedDocumentLst.splice(index, 1)
              this.approvalForm.controls['ObjectStorageId'].setValue(null);
              this.approvalForm.controls['DocumentName'].setValue(null);
              this.FileName = null;
              this.isLoading = false;
              this.alertService.showSuccess("Your file is deleted successfully!")
            } else {
              this.isLoading = false;
              this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
            }
          } catch (error) {

            this.alertService.showWarning("An error occurred while trying to delete! " + error)
          }

        }), ((err) => {

        })
      
  }

  savebutton(){
    // if(this.approvalForm.get('id').value === 0){
    //   this.LstClientApproval.push(this.approvalForm.value);
    // }
    // else{
    //   this.LstClientApproval.map(obj => obj.id === this.approvalForm.get('id') ? this.approvalForm.value : obj);
    // }

    this.submitted = true;

    if(this.approvalForm.invalid){
      this.alertService.showWarning("Please fill all the required fields");
      return;
    }

    this.approvalForm.get('RefrenceObject').setValue(JSON.stringify(this.employeeDetails.ELCIds));
    this.activeModal.close(this.approvalForm.value);

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
      text:  "Are you sure you want to exit?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        try {

          if(this.g.Idx.value === 0 && this.g.ObjectStorageId.value !== null && this.g.ObjectStorageId.value > 0){
            this.isLoading = true;
            this.spinnerText = "Deleting";
    
    
            this.fileuploadService.deleteObjectStorage((this.approvalForm.get('ObjectStorageId').value)).subscribe((res) => {
              console.log(res);
              let apiResult  = (res);
              try {
                if (apiResult.Status) {
  
                  this.approvalForm.controls['ObjectStorageId'].setValue(null);
                  this.approvalForm.controls['DocumentName'].setValue(null);
                  this.FileName = null;
                  this.isLoading = false;
                  this.alertService.showSuccess("Your file is deleted successfully!");
                  this.closeModal();

                } else {
                  this.isLoading = false;
                  this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
                }
              } catch (error) {
    
                this.alertService.showWarning("An error occurred while trying to delete! " + error)
              }
    
            }), ((err) => {
    
            })
          }
          else{
            this.closeModal();
          }

           
          //  this.activeModal.close('Modal Closed');


        } catch (error) {

        }



      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }

  closeModal() {

    // if (this.unsavedDocumentLst.length > 0) {

    //   this.unsavedDocumentLst.forEach(element => {


    //     try {
    //       this.unsavedDeleteFile(element.Id);

    //     } catch (error) {

    //     }

    //     this.activeModal.close('Modal Closed');
    //   });
    // }
    // else {
    
    //   this.activeModal.close('Modal Closed');
    // }

    this.activeModal.close('Modal Closed');

  }

}
