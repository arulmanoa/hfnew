import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { appSettings } from '../configs/app-settings.config';
import 'rxjs';
import { ClientDocuments } from '@services/model/Document/DocumentCategory';

@Injectable({
    providedIn: 'root'
})

export class ClientDocumentService {
    constructor(private http: HttpService) { }

    getClientDocumentsLookupDetails(): any {
        return this.http.get(appSettings.GET_LOADCLIENTDOCUMENTLOOKUPDETAILS)
            .map(res => res)
            .catch(
                err => (err)
            );
    };

    upsertClientDocuments(data: ClientDocuments) {
        return this.http.put(appSettings.POST_CLIENT_DOCUMENTS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    };

    getClientDocumentsByClientId(id: number): any {
        let req_param = `clientId=${id}`;
        return this.http.get(appSettings.GET_CLIENTDOCUMENTS_BY_CLIENTID + req_param)
            .map(res => res)
            .catch(
                err => (err)
            );
    };
    getClientDocumentsByEmployeeId(empId: number, documentCategoryid: number) {
        let req_param = `EmployeeId=${empId}&DocumentCategoryId=${documentCategoryid}`;
        return this.http.get(appSettings.GET_CLIENTDOCUMENTS_BY_EMPLOYEEID + req_param)
            .map(res => res)
            .catch(
                err => (err)
            );
    };

    getClientDocumentsById(id: number): any {
        let req_param = `Id=${id}`;
        return this.http.get(appSettings.GET_CLIENTDOCUMENTS_BY_ID + req_param)
            .map(res => res)
            .catch(
                err => (err)
            );
    };

    deleteClientDocuments(data: ClientDocuments) {
      return this.http.put(appSettings.DELETE_CLIENTDOCUMENTS, data)
            .map(res => res)
            .catch(
                err => (err)
            );
    };

}