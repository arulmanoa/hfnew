import { Component, OnInit, Input } from '@angular/core';

import { FileUploadService } from '../../../_services/service/fileUpload.service';
import { AlertService } from '../../../_services/service/alert.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-file-download-new',
  templateUrl: './file-download-new.component.html',
  styleUrls: ['./file-download-new.component.css']
})
export class FileDownloadNewComponent implements OnInit{

  @Input('documentId') documentId: any;

  constructor(
    public fileuploadService: FileUploadService,

    public alertService: AlertService,
    private Customloadingspinner: NgxSpinnerService,

  ) {

    // this.api.get("http://35.196.231.3/mint.api/api/download?DocumentId=323")
    //       .subscribe((data) => {
    //             this.fileinfo = data;
    //             this.downloadFile(this.fileinfo.DocumentBytes, this.fileinfo.DocumentName);
    //       },
    //       //error => this.msg = <any>error
    //     );

   }

  ngOnInit() {
  }

  previewLetter1() {
    this.Customloadingspinner.show();
    this.fileuploadService.downloadObjectAsBlob(this.documentId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.Customloadingspinner.hide();
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        console.log('res', res);
        saveAs(res);
        this.Customloadingspinner.hide();
      },error => {
        this.Customloadingspinner.hide();
      });



  }

  unique_fileName(fileName: string, fileExtension: string) {
    const today = new Date();
    const newFileName =
      fileName +
      today.getFullYear().toString() +
      today.getMonth().toString() +
      1 +
      today.getDate().toString() +
      today.getHours().toString() +
      today.getMinutes().toString() +
      today.getMilliseconds().toString() +
      '.' +
      fileExtension;

    return newFileName;
  }



//   public base64ToBlob(b64Data, contentType='', sliceSize=512) {
//     b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
//     let byteCharacters = atob(b64Data);
//     let byteArrays = [];
//     for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
//         let slice = byteCharacters.slice(offset, offset + sliceSize);

//         let byteNumbers = new Array(slice.length);
//         for (var i = 0; i < slice.length; i++) {
//             byteNumbers[i] = slice.charCodeAt(i);
//         }
//         let byteArray = new Uint8Array(byteNumbers);
//         byteArrays.push(byteArray);
//     }
//     return new Blob(byteArrays, {type: contentType});
// }

// downloadFile(b64encodedString: string, filename:string) {
//   if (b64encodedString) {
//     var blob = this.base64ToBlob(b64encodedString, 'text/plain');
//     FileSaver.saveAs(blob, filename);
//   }
// }

}
