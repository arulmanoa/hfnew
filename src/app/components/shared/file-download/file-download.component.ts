import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RequestOptions } from '@angular/http';
import 'rxjs/add/observable/throw';
import * as FileSaver from 'file-saver';
import { GlobalConfigurationValues, SessionKeys } from 'src/app/app.config';
import { AppService } from '../../Service/app.service';
import { DocumentsRepository } from '../../Models/DocumentsRepository';

import { HttpParams } from '@angular/common/http';
import { EndPointModel } from '../../Models/ConfigModel';
@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.css'],
  providers: [AppService]
})
export class FileDownloadComponent implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('documentId') documentId: any;
  // tslint:disable-next-line:no-input-rename
  @Input('documentName') DocumentName: any;
  msg: string;
  indLoading: boolean;
  modalTitle: string;
  modalBtnTitle: string;
  apiEndpoints: EndPointModel;;
  document: DocumentsRepository;
  documentName: string;

  constructor(private appService: AppService) {

  }

  ngOnInit() {
   this.apiEndpoints = <EndPointModel> JSON.parse(this.appService.getSessionStorage(SessionKeys.Api_endpoints));
    setTimeout(() => {
      this.documentName = this.DocumentName;
    }, 100);
  }


  GetDocumentDetails() {

    // const options = new RequestOptions({ params: { DocumentId: this.documentId } });
    const parameters = {
      DocumentId: this.documentId
    };


    const params = new HttpParams().set('DocumentId', this.documentId);

    const url = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_GETDOCUMENT_ENDPOINT + params;
    this.appService.get(url)
      .subscribe(val => {
        this.document = val;
        this.downloadAttachment();
        this.indLoading = false;
      },
        error => this.msg = <any>error);
  }

  downloadAttachment() {
    const doc = new DocumentsRepository();
    doc.Id = this.documentId;

    this.appService
      .downloadData(
        this.apiEndpoints.BASE_URL + 'api/download/',
        doc
      )
      .subscribe(
        blob => {
          const fileName = this.GetUniqueFileName(this.document.DocumentName, this.document.FileExtension);
          this.downloadFile(fileName, blob);
        },
        error => {
          this.msg = <any>error;
        }
      );
  }

  downloadFile(fileName: string, data: any) {
    const downloadUrl = URL.createObjectURL(data);
    console.log('from downloadFile');
    const blob = new Blob([data], {
      type: this.document.ContentType
    });
    FileSaver.saveAs(blob, fileName);
  }

  GetUniqueFileName(fileName: string, fileExtension: string) {
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

}
