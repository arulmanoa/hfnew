import { Component, OnInit } from '@angular/core';
import { AlertService, FileUploadService } from 'src/app/_services/service';
import Swal from "sweetalert2";
import { apiResult } from 'src/app/_services/model/apiResult';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';

@Component({
  selector: 'app-s3-upload',
  templateUrl: './s3-upload.component.html',
  styleUrls: ['./s3-upload.component.css']
})
export class S3UploadComponent implements OnInit {

  constructor(
    private alertService: AlertService,
    public fileuploadService: FileUploadService

  ) { }

  ngOnInit() {
  }

  


  onFileUpload(e) {
   
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
       
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
    


      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {

        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, file.name)

      };

    }

  }

  doDeleteFile() {
    // this.spinnerStarOver();

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
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {
    // if (this.isGuid(this.popupId)) {

    //   this.deleteAsync();
    // }
    // else if (this.firstTimeDocumentId != this.DocumentId) {

    //   this.deleteAsync();

    // }

    // else {
    //   this.FileName = null;
    //   this.academicForm.controls['IsDocumentDelete'].setValue(true);
    //   this.academicForm.controls['FileName'].setValue(null);

    // }
  } else if (result.dismiss === Swal.DismissReason.cancel) {

    swalWithBootstrapButtons.fire(
      'Cancelled',
      'Your request has been cancelled',
      'error'
    )
  }
})
  }

  deleteAsync(DocumentId) {



        this.fileuploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {


          console.log(res);
          let apiResult: apiResult = (res);
          try {
            if (apiResult.Status) {

              //search for the index.
              // var index = this.unsavedDocumentLst.map(function (el) {
              //   return el.Id
              // }).indexOf(this.DocumentId)

              // Delete  the item by index.
              // this.unsavedDocumentLst.splice(index, 1)
              // this.academicForm.controls['DocumentId'].setValue(null);
              // this.academicForm.controls['FileName'].setValue(null);
              // this.FileName = null;
              // this.DocumentId = null;
              // this.academicForm.controls['IsDocumentDelete'].setValue(false);
              // this.isLoading = true;
              // this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")

            } else {
              // this.isLoading = true;
              this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
            }
          } catch (error) {

            this.alertService.showWarning("An error occurred while  trying to delete! " + error)
          }

        }), ((err) => {

        })
     
  }




  doAsyncUpload(filebytes, filename) {


    // try {
    //   let objStorage = new ObjectStorageDetails();
    //   objStorage.Id = 0;
    //   objStorage.CandidateId = this.objStorageJson.CandidateId;
    //   objStorage.ClientContractCode = "";
    //   objStorage.ClientCode = "";
    //   objStorage.CompanyCode = this.objStorageJson.CompanyId;
    //   objStorage.ClientContractId = this.objStorageJson.ClientContractId;
    //   objStorage.ClientId = this.objStorageJson.ClientId;
    //   objStorage.CompanyId = this.objStorageJson.CompanyId;
    //   objStorage.Status = true;
    //   objStorage.Content = filebytes;
    //   objStorage.SizeInKB = 12;
    //   objStorage.ObjectName = filename;
    //   objStorage.OriginalObjectName = filename;
    //   objStorage.Type = 0;
    //   objStorage.ObjectCategoryName = "Proofs";



    //   this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {



    //     let apiResult: apiResult = (res);
    //     try {
    //       if (apiResult.Status && apiResult.Result != "") {

    //         this.academicForm.controls['DocumentId'].setValue(apiResult.Result);
    //         this.academicForm.controls['FileName'].setValue(this.FileName);
    //         this.DocumentId = apiResult.Result;
    //         this.unsavedDocumentLst.push({
    //           Id: apiResult.Result
    //         })
    //         this.isLoading = true;
    //         this.alertService.showSuccess("You have successfully uploaded this file!")

    //       }
    //       else {
    //         this.FileName = null;
    //         this.isLoading = true;
    //         this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
    //       }
    //     } catch (error) {
    //       this.FileName = null;
    //       this.isLoading = true;
    //       this.alertService.showWarning("An error occurred while  trying to upload! " + error)
    //     }
    //   }), ((err) => {

    //   })

    //   console.log(objStorage);
    // } catch (error) {
    //   this.FileName = null;
    //   this.alertService.showWarning("An error occurred while  trying to upload! " + error)
    //   this.isLoading = true;
    // }

  }


  unsavedDeleteFile(_DocumentId) {

    // this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {

    //   console.log(res);
    //   let apiResult: apiResult = (res);

    //   try {
    //     if (apiResult.Status) {

    //       //search for the index.
    //       var index = this.unsavedDocumentLst.map(function (el) {
    //         return el.Id
    //       }).indexOf(this.DocumentId)

    //       // Delete  the item by index.
    //       this.unsavedDocumentLst.splice(index, 1)
    //       this.academicForm.controls['DocumentId'].setValue(null);
    //       this.academicForm.controls['FileName'].setValue(null);
    //       this.FileName = null;
    //       this.DocumentId = null;
    //       this.academicForm.controls['IsDocumentDelete'].setValue(false);


    //     } else {

    //     }
    //   } catch (error) {


    //   }


    // }), ((err) => {

    // })

  }
}
