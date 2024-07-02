import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { FileUploadService } from './fileUpload.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from './alert.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root'
})


export class DownloadService {

    constructor(
        private fileUploadService : FileUploadService,
        private alertService : AlertService,
        private loadingSreenService : LoadingScreenService
    ) { }

    public base64Toxls(b64Data, dynoFileName: any, sliceSize = 512) {
     

      dynoFileName = dynoFileName.replace(/\./g, ' ')
      let byteCharacters = atob(b64Data); //data.file there
      let byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          let slice = byteCharacters.slice(offset, offset + sliceSize);
          let byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }
          let byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
      }
      // dynoFileName += moment().format('DD-MMM-YYYY');
      const file = new Blob(byteArrays, { type: 'application/vnd.ms-excel' });
      FileSaver.saveAs(file, dynoFileName);
      return new Blob(byteArrays, { type: 'application/vnd.ms-excel' });


  }
  public base64Toxlsx(b64Data, dynoFileName: any, sliceSize = 512) {
   

    dynoFileName = dynoFileName.replace(/\./g, '')
    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);
        let byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    // dynoFileName += moment().format('DD-MMM-YYYY');
    const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(file, dynoFileName);
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });


}


    public base64ToBlob(b64Data, dynoFileName: any, sliceSize = 512) {
        dynoFileName = dynoFileName.replace(/\./g, ' ')
        let byteCharacters = atob(b64Data); //data.file there
        let byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        // dynoFileName += moment().format('DD-MMM-YYYY');
        const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(file, dynoFileName);
        return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }


    public base64ToZip(b64Data, dynoFileName: any, sliceSize = 512) {

        var dynoFileNames = dynoFileName.replace(/\./g, ' ')
        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }
        // dynoFileNames += moment().format('DD-MMM-YYYY');
        dynoFileNames += '.zip';

        var blob = new Blob(byteArrays, { type: 'application/zip, application/octet-stream' });
        FileSaver.saveAs(blob, dynoFileNames);

        return blob;
    }

    public convertBase64ContentTypeToBlob(b64Data, contentType : string , sliceSize = 512) {
        let byteCharacters = atob(b64Data); //data.file there
        let byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          let slice = byteCharacters.slice(offset, offset + sliceSize);
          let byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          let byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const file = new Blob(byteArrays, { type: contentType });
        return new Blob(byteArrays, { type: contentType });
      }

   public downloadFiles(documentIds : number[]){
    for(let documentId of documentIds){
        this.loadingSreenService.startLoading();
        this.fileUploadService.getObjectStorage(documentId).subscribe(data => {
          this.loadingSreenService.startLoading();
          if (data.Status !== false && data.Result !== null && data.Result !== undefined) {

            var objDtls = data.Result;
            var contentType =  this.fileUploadService.getContentType(objDtls.ObjectName);
            
            const file = this.convertBase64ContentTypeToBlob(objDtls.Content , contentType );

            FileSaver.saveAs(file, objDtls.ObjectName);

            this.loadingSreenService.stopLoading();
          }
  
        } , error => {
          this.alertService.showWarning("Unknown Error Occured");
          this.loadingSreenService.stopLoading();
          console.error(error);
        })
  
  
  
        // this.loadingSreenService.startLoading();
        // this.fileUploadService.downloadObjectAsBlob(documentId)
        //   .subscribe(res => {
        //     if (res == null || res == undefined) {
        //       this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
        //       return;
        //     }
        //     console.log('res', res);
        //     // saveAs(file, dynoFileName + new Date().getTime());
        //     saveAs(res);
        //     this.loadingSreenService.stopLoading();
        //   });
  
      }  
   }

   public downloadFilesInZip(documentIds : number[] , fileName : string){
        this.loadingSreenService.startLoading();
        this.fileUploadService.GetStoredObjectsInZipFile(documentIds).subscribe(data => {
          this.loadingSreenService.stopLoading();  
          if (data.Status !== false && data.Result !== null && data.Result !== undefined) {
            this.base64ToZip(data.Result.Content, fileName);
            this.loadingSreenService.stopLoading();
            } 
          else{
            this.alertService.showWarning(data.Message);
          }
  
        } , err => {
          this.alertService.showWarning("Unknown Error Occured");
          this.loadingSreenService.stopLoading();
          console.error(err);
        })
   }

   //Returns a Promise with Type {Status : boolean , Message : string}
   GetAndViewDocumentOnNewTab(objectStorageId : number){
       return new Promise((resolve, reject) => {
        try{
            this.fileUploadService.getObjectStorage(objectStorageId).subscribe(data => {
                var objDtls = data.Result;
                var contentType =  this.fileUploadService.getContentType(objDtls.ObjectName);
        
                const file =  this.convertBase64ContentTypeToBlob(objDtls.Content , contentType , objDtls.ObjectName);
        
                if (file !== null) {
                    let fileURL = null;
        
                    const newPdfWindow = window.open('', '');
        
                    const content = encodeURIComponent(objDtls.Content);
        
                    // tslint:disable-next-line:max-line-length
                    const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';
        
                    const iframeEnd = '\'><\/iframe>';
        
                    newPdfWindow.document.write(iframeStart + content + iframeEnd);
                    newPdfWindow.document.title = objDtls.ObjectName;

                    resolve({Status : true, Message : "Success!"})
                }
                else{
                    reject({Status : false , Message : "Unexpected Error Occured."})
                }
            } , error => {
                reject({Status : false , Message : "Unexpected Error Occured."})
            })
        }
        catch(ex){

        }
        
       }
       )
    

}

public downloadFile(documentId : number){
    
  this.loadingSreenService.startLoading();
  this.fileUploadService.getObjectById(documentId).subscribe(data => {
    this.loadingSreenService.startLoading();
    if (data.Status !== false && data.Result !== null && data.Result !== undefined) {
      var objDtls = data.Result;
      var contentType =  this.fileUploadService.getContentType(objDtls.ObjectName);
      
      const file = this.convertBase64ContentTypeToBlob(objDtls.Content , contentType );
      FileSaver.saveAs(file, objDtls.ObjectName);
      this.loadingSreenService.stopLoading();
    }

  } , error => {
    this.alertService.showWarning("Unknown Error Occured");
    this.loadingSreenService.stopLoading();
    console.error(error);
  })


}


}
