
import { Component, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { switchMap, takeUntil } from 'rxjs/operators';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientContactService, CommonService, ESSService, EmployeeService, FileUploadService } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadHrDocsComponent } from './upload-hr-docs/upload-hr-docs.component';
import { ClientDocumentService } from '@services/service/client-document.service';
import { apiResponse } from '@services/model/apiResponse';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { UIMode } from '@services/model/UIMode';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

@Component({
  selector: 'app-hrpolicy',
  templateUrl: './hrpolicy.component.html',
  styleUrls: ['./hrpolicy.component.css']
})
export class HrpolicyComponent implements OnInit {
  _loginSessionDetails: LoginResponses;
  extrafiles:any;
  selectedClientId: any = 0;
  BusinessType: any;
  HrPolicyFiles = [];
  HrPolicyFilesS3: any[] = [];
  duplicateHrPolicyFilesS3:any[]=[];
  manipulatedData: any;
  employeeDetails: EmployeeDetails = {} as any;
  clientsList: any;
  ClientId: any = 0;
  ClientContractId: any = 0;
  EmployeeId: number = 0;
  spinner: boolean = false;
  private stopper: EventEmitter<any> = new EventEmitter();
  RoleCode: string;
  documentURLId: any;
  documentURL: SafeResourceUrl;
  documentCategoryList: any;
  ClientDocumentsFolder:any;
  showVideoModal: boolean = false;
  videoSource: SafeResourceUrl = "";
  selectedFolderName: string | null = null;
  searchText:any='';
  filesCount:any;
  folderCount:any;
  isDownload:any=false;
  // @ViewChild("videoModal") videoModal: TemplateRef<any>;
  constructor(public sessionService: SessionStorage, private commonService: CommonService, public modalService: NgbModal, private clientDocumentService: ClientDocumentService, private clientContactService: ClientContactService, public fileuploadService: FileUploadService, private alertService: AlertService, private sanitizer: DomSanitizer,  private loadingScreenService: LoadingScreenService, private activeModal: NgbActiveModal,  private titleService : Title,
    public loadingService: LoadingScreenService
  ) {
    this.clientDocumentService.getClientDocumentsLookupDetails().pipe(takeUntil(this.stopper)).subscribe((data: any) => {
      if (data.Status) {
        this.documentCategoryList = data.dynamicObject && data.dynamicObject.documentcategoryList;
        this.ClientDocumentsFolder = data.dynamicObject && data.dynamicObject.ClientDocumentsFolder;
      } else {
        this.alertService.showWarning(data.Message)
      }
    })
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
   }

  ngOnInit() {
    this.titleService.setTitle('Company Policy Documents');
    // console.log(this.videoModal.elementRef.nativeElement, 'Video modal template')
    this.spinner = true;
    this.employeeDetails = null;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.selectedClientId = this.sessionService.getSessionStorage("default_SME_ClientId") || 0;
    this.selectedClientId = this.sessionService.getSessionStorage("default_SME_ClientId") || 0;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.selectedClientId = this.BusinessType == 3 ? 0 : this.sessionService.getSessionStorage("default_SME_ClientId") || 0;
    this.HrPolicyFiles = [];
    this.EmployeeId = this._loginSessionDetails.EmployeeId;

    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    //  this.employeeService.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).subscribe((result) => {
    //   let apiResult: apiResult = result;
    //   console.log('EMP REQUIRED DATA PROFILE ::', apiResult)
    //   if (apiResult.Status && apiResult.Result != null) {
    //     this.employeeDetails = apiResult.Result as any;
    //     this.spinner = false;
    //     this.ClientId = this.employeeDetails != null && this.employeeDetails.EmploymentContracts != null && this.employeeDetails.EmploymentContracts.length > 0 ? this.employeeDetails.EmploymentContracts[0].ClientId : 0;
    //     this.ClientContractId = this.employeeDetails != null && this.employeeDetails.EmploymentContracts != null && this.employeeDetails.EmploymentContracts.length > 0 ? this.employeeDetails.EmploymentContracts[0].ClientContractId : 0;
    //     var isExists = this.BusinessType != 3 ? environment.environment.HRPolicyFiles.find(a => a.ClientId == this.ClientId && a.ClientContractId == this.ClientContractId) : this.BusinessType == 3 ? environment.environment.HRPolicyFiles.find(a => a.ClientId == 0 && a.ClientContractId == 0) : null;
    //     if (isExists != undefined) {
    //       this.mappingWithClientId(isExists.Docs);
    //     }
    //   } else {
    //     this.spinner = false;
    //   }

    // }, err => {
    //   this.spinner = false;
    // });
    if (this.RoleCode == 'Employee') {
      this.getClientDocumentForEmployee();
    } else {
      if (this.BusinessType == 3) {
        this.getClientsList();
      } else {
        this.getClientDocuments();
      }
    }
    this.deselectFolder();
};

  getClientDocuments(){
    if([null, undefined, 0].includes(this.selectedClientId)){
      return;
    }
    this.spinner = true;
    this.clientDocumentService.getClientDocumentsByClientId(this.selectedClientId).subscribe((data: apiResponse) => {
      console.log(data);
      this.spinner = false;
      if(data.Status){
        this.HrPolicyFilesS3 = data.dynamicObject;
        let videoCategory = this.documentCategoryList.find((item: any) => item.Name.includes('ClientVideos'));
        this.manipulatedData = this.getGroupedDocuments();
        this.folderCount=Object.keys(this.manipulatedData).length;
        console.log('tushardata',this.manipulatedData);
        this.HrPolicyFilesS3=this.HrPolicyFilesS3.filter(item=>item.FolderId==0);
        this.filesCount=this.HrPolicyFilesS3.length;
        // this.HrPolicyFilesS3 = this.HrPolicyFilesS3.filter((file: any) => file.DocumentCategoryId != ((videoCategory != null && videoCategory != undefined) ? videoCategory.Id : 0)).sort((a, b) => a.LstClientDocumentSettings[0].DisplayOrder - b.LstClientDocumentSettings[0].DisplayOrder);
        this.HrPolicyFilesS3 = this.HrPolicyFilesS3.sort((a, b) => a.LstClientDocumentSettings[0].DisplayOrder - b.LstClientDocumentSettings[0].DisplayOrder);
        this.duplicateHrPolicyFilesS3=this.HrPolicyFilesS3;
      } else {
        this.alertService.showWarning(data.Message)
      }
    }, (err) => this.spinner = false)
  };

  getGroupedDocuments() {
    const groupedDocuments = {};
    this.HrPolicyFilesS3.forEach(doc => {
      if (doc.FolderId > 0) {
        const folder = this.ClientDocumentsFolder.find(f => f.Id === doc.FolderId);
        if (folder) {
          const folderName = folder.Name;
          if (!groupedDocuments[folderName]) {
            groupedDocuments[folderName] = [];
          }
          groupedDocuments[folderName].push(doc);
        }
      }
    });
    Object.keys(groupedDocuments).forEach(folderName => {
      groupedDocuments[folderName].sort((a, b) => {
        const aOrder = a.LstClientDocumentSettings[0].DisplayOrder;
        const bOrder = b.LstClientDocumentSettings[0].DisplayOrder;
        return aOrder - bOrder;
      });
    });
  
    return groupedDocuments;
  }
  


  selectFolder(folderName: string): void {
    this.selectedFolderName = folderName;
    this.duplicateHrPolicyFilesS3=this.HrPolicyFilesS3;
    this.HrPolicyFilesS3 = this.manipulatedData[folderName];
    this.getSearchResult();
  }

  deselectFolder(){
    this.searchText="";
    this.selectedFolderName = null;
    this.HrPolicyFilesS3=this.duplicateHrPolicyFilesS3;
    this.getSearchResult();
  }

  getClientDocumentForEmployee() {
    console.log(this.EmployeeId);
    this.spinner = true;
    this.clientDocumentService.getClientDocumentsByEmployeeId(this.EmployeeId, 0).subscribe((data: any) => {
      this.spinner = false;
      if(data.Status){
        this.HrPolicyFilesS3 = data.dynamicObject;
        let videoCategory = this.documentCategoryList.find((item: any) => item.Name.includes('ClientVideos'));
        this.manipulatedData = this.getGroupedDocuments();
        console.log('tushardata',this.manipulatedData)
        this.folderCount=Object.keys(this.manipulatedData).length;
        this.HrPolicyFilesS3=this.HrPolicyFilesS3.filter(item=>item.FolderId==0);
        this.filesCount=this.HrPolicyFilesS3.length;
        this.HrPolicyFilesS3 = this.HrPolicyFilesS3.sort((a, b) => a.LstClientDocumentSettings[0].DisplayOrder - b.LstClientDocumentSettings[0].DisplayOrder);
        this.duplicateHrPolicyFilesS3=this.HrPolicyFilesS3;
        // this.HrPolicyFilesS3 = this.HrPolicyFilesS3.filter((file: any) => file.DocumentCategoryId != ((videoCategory != null && videoCategory != undefined) ? videoCategory.Id : 0)).sort((a, b) => a.LstClientDocumentSettings[0].DisplayOrder - b.LstClientDocumentSettings[0].DisplayOrder);
      } else {
        this.alertService.showWarning(data.Message)
      }
  }, (err) => {
    this.spinner = false;
    this.alertService.showWarning(err)
  })
    // this.essService.GetEmployeeDocumentAccessTransactionsByEmployeeId(this.EmployeeId).subscribe((data: any) => {
    //     console.log(data)
    //     this.spinner = false;
    //     // if(data.Status){
    //     //   this.HrPolicyFilesS3 = data.dynamicObject;
    //     // } else {
    //     //   this.alertService.showWarning(data.Message)
    //     // }
    // })
  };

  getDocumentByObjectId(objectId: number){
    this.fileuploadService.getObjectById(objectId).subscribe((data: any) => {
      console.log(data)
    })
  };

  getSearchResult(){
    
    this.filesCount=this.HrPolicyFilesS3.filter(item => 
      item.DisplayName.toLowerCase().includes(this.searchText.toLowerCase())
    ).length;

    const flattenedData = [].concat.apply([], Object.values(this.manipulatedData));
    // Filter the flattened data based on the search term
    // this.folderCount = flattenedData.filter(item => {
    //   return item.Name.toString().toLowerCase().includes(this.searchText.toLowerCase())
    // }).length;
    this.folderCount=Object.keys(this.getFilteredFolders()).length;
  }

  deleteDocument(obj: any) {
    let id = obj.LstClientDocumentSettings[0].ObjectStorageId;
    this.spinner = true;
    this.fileuploadService.deleteObjectStorage(id).pipe(takeUntil(this.stopper), switchMap((response: any) => {
      if (response.Status) {
        return this.clientDocumentService.deleteClientDocuments(obj).pipe(takeUntil(this.stopper))
      } else {
        this.spinner = false;
        this.alertService.showWarning(response.Message);
      }
    })).subscribe((data: apiResult) => {
      if (data.Status) {
        this.spinner = false;
        this.alertService.showSuccess('Document Deleted Successfully');
        this.getClientDocuments();
      } else {
        this.alertService.showSuccess("An error occurred while  trying to delete! " + data.Message)
      }
    }, (err) => this.spinner = false)
  };
  getFilteredItems() {
    return this.HrPolicyFilesS3.filter(item => 
      item.DisplayName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getFilteredFolders() {
    let temp = Object.keys(this.manipulatedData).filter(key => 
      key.toLowerCase().includes(this.searchText.toLowerCase())
    );
    let filteredFolders = {};
    temp.forEach(key => filteredFolders[key] = this.manipulatedData[key]);
    return filteredFolders;
  }


  doDeleteFile(obj: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure you want to delete?",
        text: "This item will be deleted immediately. You can't undo this file.",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Ok!",
        cancelButtonText: "No, cancel!",
        allowOutsideClick: false,
        reverseButtons: true,
      })
      .then((result) => {
        console.log(result);

        if (result.value) {
          console.log(obj);
          obj.modetype = UIMode.Delete;
          obj.status = 0;
          obj.LstClientDocumentSettings[0].modetype = UIMode.Delete;
          obj.LstClientDocumentSettings[0].status = 0;
          this.deleteDocument(obj);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "Your request has been cancelled",
            "error"
          );
        }
      });
  }

  getClientsList(){
    this.clientContactService
      .getclientList()
      .pipe(takeUntil(this.stopper)).subscribe((data: any) => {
        this.clientsList = data.dynamicObject;
      })
  }

  mappingWithClientId(e) {
    e.forEach(element => {
      var name = element.split(".")[1];
      this.HrPolicyFiles.push({
        filename: element,
        type: name
      })

    });
  }

  download_form(item) {

    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = `assets/file/${item.filename}`;
    // link.download = 'assets/file/BulkImportTemplate.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }


  // getImageSrc(img_url): Observable<any> {
  //   console.log('GET IMGAGE SRC :: ', img_url);
  //   let options = new RequestOptions({ responseType: ResponseContentType.Blob });
  //   return this.http.get(`assets/file/${img_url}`, options)
  //     .pipe(map(res => res.blob()))

  // }

  // download_template(item) {
  //   this.getImageSrc(item.filename).subscribe(
  //     blob => {
  //       var fileName = item.filename;
  //       FileSaver.saveAs(blob, fileName)
  //     },
  //     error => {
  //       console.log(error);
  //     }
  //   );

  // }

//   openDoc(item: any) {
//     console.log(item)
//     let contentType = this.fileuploadService.getContentType(item.DisplayName + item.Extension)
//     this.fileuploadService.getObjectById(item.LstClientDocumentSettings[0])
//       .subscribe(dataRes => {

//         if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
//           return;
//         }
//         var objDtls = dataRes.Result;
//         const byteArray = atob(objDtls.Content);
//         const blob = new Blob([byteArray], { type: contentType });
//         let file = new File([blob], objDtls.ObjectName, {
//           type: contentType,
//           lastModified: Date.now()
//         });
//         if (file !== null) {
//           const fileUrl = URL.createObjectURL(file)
//           let fileName = item.DisplayName + item.Extension;
//           let link = document.createElement('a');
//           link.download = fileName;
//           link.target = '_blank';
//           link.href = fileUrl;
//           link.click();
//         }
//       });
//  };

  openUploadDocModal(){
    const modalRef = this.modalService.open(UploadHrDocsComponent);
    modalRef.result.then((result) => {
      console.log(result)
      if (result != "Model Closed") {
        this.getClientDocuments();
      }
    }).catch((error) => {
      console.log(error);
    });
  };

  viewDocument(item: any, template: any) {
    console.log(item);
    item['DocumentId'] = item.LstClientDocumentSettings && item.LstClientDocumentSettings.length && item.LstClientDocumentSettings[0].ObjectStorageId;
        item['FileName'] = `${item.DisplayName}.${item.Extension}`;
        this.isDownload=item.IsDowloadApplicable;
    if(item.Extension == "mp4"){
      this.documentURLId = item.DocumentId;
      this.loadingScreenService.startLoading();
      this.fileuploadService.getObjectById(item.DocumentId)
        .subscribe((dataRes: any) => {
          console.log(dataRes)
          if (dataRes.Status && dataRes.Result  && dataRes.Result.Content && dataRes.Result.Attribute1) {
            this.loadingScreenService.stopLoading();
            let url = 'data:' + dataRes.Result.Attribute1 + ';base64,' + encodeURIComponent(dataRes.Result.Content);
            this.videoSource = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            // this.showVideoModal = true;
            this.activeModal = this.modalService.open(template);
            console.log(this.videoSource)
          }
          
        });
    } else {
      const modalRef = this.modalService.open(PreviewdocsModalComponent);
      modalRef.componentInstance.docsObject = item;
      modalRef.componentInstance.isDownloadAllowed = item.IsDowloadApplicable;
      modalRef.result.then((result) => {
        if (result != "Model Closed") {

        }
      }).catch((error) => {
        console.log(error);
      });
    };
        
       
    // let LstClientDocumentSettings = [];
    // this.clientDocumentService.getClientDocumentsById(item.Id).subscribe((data: any) => {
    //   console.log(data)
    //   if (data.Status) {
    //     if (data.dynamicObject.LstClientDocumentSettings != null && data.dynamicObject.LstClientDocumentSettings.length)
    //       LstClientDocumentSettings = data.dynamicObject.LstClientDocumentSettings;
    //     console.log(item)
    //     item['DocumentId'] = LstClientDocumentSettings[0].ObjectStorageId;
    //     item['FileName'] = `${item.DisplayName}.${item.Extension}`;
    //     const modalRef = this.modalService.open(PreviewdocsModalComponent);
    //     modalRef.componentInstance.docsObject = item;
    //     modalRef.componentInstance.isDownloadAllowed = item.IsDowloadApplicable;
    //     modalRef.result.then((result) => {
    //       if (result != "Model Closed") {

    //       }
    //     }).catch((error) => {
    //       console.log(error);
    //     });
    //   } else {
    //     console.log(data)
    //   }
    // })
  };

  sendDocumentViaMail(){
      
  };

  downloadDocument(item:any,template: any){
    let id = item.LstClientDocumentSettings && item.LstClientDocumentSettings.length && item.LstClientDocumentSettings[0].ObjectStorageId;
    this.loadingService.startLoading();
    this.fileuploadService.downloadObjectAsBlob(id)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.loadingService.stopLoading();
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        console.log('res', res);
        saveAs(res);
        this.loadingService.stopLoading();
      },error => {
        this.loadingService.stopLoading();
      });
  };

  isDocumentVisible(item: any): boolean {
      if(this.RoleCode == 'Employee' && item.IsVisible){
         return true;
      } else if(this.RoleCode != 'Employee'){
        return true;
      } else {
        return false;

      }
  
  };

  editDoc(id: number){
    this.spinner=true;
    const modalRef = this.modalService.open(UploadHrDocsComponent);
    modalRef.componentInstance.documentId = id;
    this.spinner=false;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {
        this.deselectFolder();
        this.getClientDocuments();
      }
    }).catch((error) => {
      console.log(error);
    });
  };

  getDocImage(ext: string = ""){
    if(ext != ""){
      return `assets/Images/icons/${ext}.png`
    }
    else if(ext == ""){
      return 'assets/Images/icons/Folder.png'
    } else{
      return 'assets/Images/docImg.jpg'
    }
   
  };

  closeModal() {
    this.activeModal.close();
    this.deselectFolder();
  };


}

