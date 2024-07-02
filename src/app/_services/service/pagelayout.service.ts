import { ComponentFactoryResolver, Injectable, ViewContainerRef } from '@angular/core';
import { HttpService } from './http.service';
import { appSettings, LoginResponses } from '../model';
import { PageLayout, DataSource, SearchElement, ColumnDefinition, GridConfiguration, ColumnFilterSettings, ColumnSortingSettings } from 'src/app/views/personalised-display/models';
import { HttpHeaders } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { FormAuditModel } from 'src/app/views/generic-form/form-models';
import { Column, Formatters, GroupTotalFormatters, Aggregators, Formatter, GridOption, Editors, FieldType, Filters, Filter, AngularUtilService, ColumnFilter, AngularGridInstance, OperatorString, CurrentFilter, ColumnSort, CurrentSorter, SortDirectionString } from 'angular-slickgrid';
import { RowSelectionType, DataSourceType } from 'src/app/views/personalised-display/enums';
import _ from 'lodash';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { GridFormatters } from './CustomGridFormatter/GridFormatters';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { InstanceLoader } from './InstanceLoader';
import { Type } from '@angular/core';
import { CommaSeparatedStringFilterHandler } from 'src/app/grid-filters/comma-separated-strings/CommaSeparatedStringFilterHandler';
import { CommaSeparatedStringsFilterComponent } from 'src/app/grid-filters/comma-separated-strings/comma-separated-strings-filter/comma-separated-strings-filter.component';


const highlightingFormatter = (row, cell, value, columnDef, dataContext) => {


  if (dataContext) {
    if (dataContext.Status == 100) {
      return `<span style=" display: inline-block;
          padding: .55em .8em;
          font-size: 90%;
          font-weight: 400;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: .375rem;
          transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    } else if (dataContext.Status == 400) {
      return `<span style=" display: inline-block;
       padding: .55em .8em;
       font-size: 90%;
        font-weight: 400;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #00d97e;
        background-color: #ccf7e5;">${dataContext.StatusName}</span>`;
    }
    else if ((dataContext.Status == 200 || dataContext.Status == 300)) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #e63757;
      background-color: #fad7dd;">${dataContext.StatusName}</span>`;
    }

    else if (dataContext.Status == 600) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    }
    else {
      return value;
    }

  }
};

@Injectable({
  providedIn: 'root'
})
export class PagelayoutService {
  //tempSubject = new Subject<any>();

  readonly CommonColumnFilterSettings: string = 'CommonColumnFilterSettings';
  readonly CommonColumnSortingSettings: string = 'CommonColumnSortingSettings';

  gridFormatters: GridFormatters;

  _loginSessionDetails: LoginResponses;
  UserId: any;

  constructor(
    private http: HttpService,
    private sessionService: SessionStorage,
    private angularUtilService: AngularUtilService,
    private resolver: ComponentFactoryResolver,

  ) {
    this.gridFormatters = new GridFormatters();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid

  }


  getPageLayout(code: string) {
    let req_params = `code=${code}`;
    return this.http.get(appSettings.GETPAGELAYOUT + req_params)
      .catch(err => (err));
  }

  postPageLayout(pageLayout: PageLayout) {
    //this.updatePageLayoutDB(pageLayout);
    return this.http.post(appSettings.POSTPAGELAYOUT, pageLayout)
  }

  // updatePageLayoutDB(pageLayout){
  //   this.pageLayoutDB = {
  //     Id : pageLayout.Id,
  //     Code : pageLayout.Code,
  //     Description : pageLayout.Description,
  //     CompanyId : pageLayout.CompanyId,
  //     ClientId : pageLayout.ClientId,
  //     SearchConfiguration : JSON.stringify(pageLayout.SearchConfiguration),
  //     GridConfiguration : JSON.stringify(pageLayout.GridConfiguration),
  //     PageProperties : JSON.stringify(pageLayout.PageProperties)
  //   }
  // }

  getDropDownList(dataSource: DataSource, value: any = null) {
    console.log(dataSource, value);
    if (value == null) {
      return this.http.get(dataSource.Name).map(res => res)
        .catch(err => (err));
    }
    let req_params = `CountryId=${value}`
    return this.http.get(dataSource.Name + req_params);
  }

  getDataset(dataSource: DataSource, searchElementList: SearchElement[] = null) {

    let newSearchElementList: SearchElement[] = [];


    if (searchElementList !== undefined && searchElementList !== null) {
      for (let searchElement of searchElementList) {
        newSearchElementList.push({
          FieldName: searchElement.FieldName,
          Value: searchElement.Value,
          DefaultValue: searchElement.DefaultValue
        })
      }

      if (dataSource.Type == DataSourceType.SP) {
        for (let searchElement of newSearchElementList) {
          if (searchElement.Value === null || searchElement.Value === "") {
            searchElement.Value = searchElement.DefaultValue;
          }
        }
      }
    }



    // if (dataSource.Type == DataSourceType.SP && searchElementList !== null) {
    //   searchElementList = _.cloneDeep(searchElementList);
    //   for (let searchElement of searchElementList) {
    //     if (searchElement.Value === null || searchElement.Value === "") {
    //       searchElement.Value = searchElement.DefaultValue;
    //     }
    //   }
    // }



    var data = {
      SearchElementList: newSearchElementList,
      DataSource: dataSource
    }
    return this.http.post(appSettings.GETPAGELAYOUTDATASET, data)
  }

  getColumnOrParamName(dataSource: DataSource) {
    return this.http.post(appSettings.GETCOlUMNORPARAMNAME, dataSource);
  }

  encryptedGet() {
    return this.http.encryptedGet('api/Values/EncryptedGet/5/8');
  }

  encryptedPost(data: any) {
    return this.http.post('api/Values/EncryptedPost', data);
  }

  getUsingObj() {
    let arr = JSON.stringify({ a: 2, b: 3 });
    return this.http.get(`api/Values/GetArray/${arr}`);
  }

  executeQuery(dataSource: DataSource, searchElementList: SearchElement[] = null) {
    var data = {
      SearchElementList: searchElementList,
      DataSource: dataSource
    }
    return this.http.put(appSettings.EXECUTEQUERY, data);
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
  }

  //To set grid column and grid options using grid configuartion.

  //Columns
  setColumns(columnDefinitionList: ColumnDefinition[], dataset: any = null): Column[] {
    // console.log('COLLECTIONS - MULTI SELECT DP ::', dataset);

    let columnDefinition: Column[] = [];
    let tempColumn: Column;
    let previewFormatter: Formatter;
    let approveFormatter: Formatter;
    let rejectFormatter: Formatter;
    let hyperlinkFormatter: Formatter;
    let viewLogFormatter: Formatter;
    let docsFormatter: Formatter;
    let holdFormatter: Formatter;
    let checkStatusFormatter: Formatter;
    let editbtnFormatter: Formatter;
    let decline_reqFormatter: Formatter;
    let approve_reqFormatter: Formatter;
    let info_formatter: Formatter;
    let proxy_formatter: Formatter;
    let yesorno_formatter: Formatter;

    let isSubmitted_formatter: Formatter;
    let isSubmitted_formatter1: Formatter;

    let reject_btnFormatter: Formatter;
    let approve_btnFormatter: Formatter;
    let ndcStatusFormatter: Formatter;
    let lwd_btnFormatter: Formatter;
    let displayTransactionStatusFormatter : Formatter;

    let decline_reqFormatter_withValue: Formatter;
    let approve_reqFormatter_withValue: Formatter;


    previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-eye m-r-xs" title="Preview" style="cursor:pointer"></i> ` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';


    // previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //   value ? `<i class="mdi mdi-download m-r-xs" title="Download PIS" style="cursor:pointer"></i> ` : '<i class="mdi mdi-download" style="cursor:pointer"></i>';

    approveFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && dataContext.Status != 'Approved' && dataContext.Status != 'Rejected' ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border:0;"><i
    class="mdi mdi-check-circle-outline m-r-xs" style="color: #2DA05E;"></i> Approve </button>` : '-';

    checkStatusFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
  class="mdi mdi-refresh m-r-xs"></i> Check Status </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';

    rejectFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && dataContext.Status != 'Approved' && dataContext.Status != 'Rejected' ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 0;"><i
    class="mdi mdi-close-circle-outline m-r-xs"  style="color: #FF6050;"></i> Reject </button>` : '-';

    hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value != null && value != -1 ? '<a href="javascript:;">' + value + '</a>' : '---';

    yesorno_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value != null && value == 1 ? 'Yes' : 'No';

    viewLogFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="fa fa-file-text-o m-r-xs" title="View QC History Logs" style="cursor:pointer"></i> ` : '<i class="fa fa-file-text-o" style="cursor:pointer"></i>';

    docsFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" title="Invoice docs" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
  class="fa fa-files-o m-r-xs"></i> Docs </button>` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';

    holdFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="fa fa-hand-o-up m-r-xs" title="Hold Payment" style="cursor:pointer"></i> ` : '<i class="fa fa-hand-o-up" style="cursor:pointer"></i>';

    editbtnFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && (dataContext.Status == 100 || dataContext.Status == 600) ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
  min-width: 32px;
  min-height: 32px;
  padding: 4px;
  border-radius: 50%;
  font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  text-align: center;
  vertical-align: middle;"title="View">
  <i class="fa fa-eye" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
</a>` : '---';

    decline_reqFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && (dataContext.Status == 100 || dataContext.Status == 600) ? `
      <a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
  min-width: 32px;
  min-height: 32px;
  padding: 4px;
  border-radius: 50%;
  font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  text-align: center;
  vertical-align: middle;"title="Decline">
  <i class="fa fa-ban" aria-hidden="true"  style="font-size: 16px;color: #e63757;"></i></a>` : '---';
    approve_reqFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && (dataContext.Status == 100 || dataContext.Status == 600) ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;
      font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center;
      vertical-align: middle;"title="Approve">
      <i class="fa fa-check-square" aria-hidden="true" style="font-size: 16px;color: #00d97e;"></i></a>` : '---';

    info_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `${dataContext.AppliedUnits} <i class="fa fa-info-circle" aria-hidden="true" style="font-size: 16px;color: #838383;cursor:pointer;" title=${dataContext.ApplierRemarks}></i>` : '---';

    // proxy_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //  dataContext.ManagerId == this.UserId ? `${dataContext.ManagerName} <span style=" display: inline-block;
    //  padding: .55em .8em;
    //  font-size: 90%;
    //   font-weight: 400;
    //   line-height: 1;
    //   text-align: center;
    //   white-space: nowrap;
    //   vertical-align: baseline;
    //   border-radius: .375rem;
    //   transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
    //   background-color: #f1646c;">Self</span>` : `${dataContext.ManagerName} <span style=" display: inline-block;
    //   padding: .55em .8em;
    //   font-size: 90%;
    //    font-weight: 400;
    //    line-height: 1;
    //    text-align: center;
    //    white-space: nowrap;
    //    vertical-align: baseline;
    //    border-radius: .375rem;
    //    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
    //    background-color: #40b03e;">Proxy</span>`;
    // proxy_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //    dataContext.ManagerId == this.UserId ? `${dataContext.ManagerName} ` : `${dataContext.ManagerName} `;

    displayTransactionStatusFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {
      if (value) {
        if (value == 'Saved') {
          return `<span style="color: #3f51b5; text-transform: uppercase; border-radius: 4px; background: #d0d6f9;font-family: Roboto;font-size: 10px; font-style: normal;font-weight: 500; padding: 5px"> ${value} </span>`
        }
        else if (value == 'Pending') {
          return `<span style="color: #EE9A15; text-transform: uppercase; border-radius: 4px; background: #FFE9C7;font-family: Roboto;font-size: 10px; font-style: normal;font-weight: 500; padding: 5px"> ${value} </span>`
        }
        else if (value == 'Approved') {
          return `<span style="color: #2DA05E; text-transform: uppercase; border-radius: 4px; background: #E2FEEE;font-family: Roboto;font-size: 10px; font-style: normal;font-weight: 500; padding: 5px"> ${value} </span>`
        }
        else if (value == 'Rejected') {
          return `<span style="color: #E74C3C; text-transform: uppercase; border-radius: 4px; background: #FFE4E1;font-family: Roboto;font-size: 10px; font-style: normal;font-weight: 500; padding: 5px"> ${value} </span>`
        }
        else {
          return `<span style="color: black">${value}</span>`
        }
      }
    }

    decline_reqFormatter_withValue = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `
      <a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
  min-width: 32px;
  min-height: 32px;
  padding: 4px;
  border-radius: 50%;
  font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  text-align: center;
  vertical-align: middle;"title="Decline">
  <i class="fa fa-ban" aria-hidden="true"  style="font-size: 16px;color: #e63757;"></i></a>` : '---';
    approve_reqFormatter_withValue = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;
      font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center;
      vertical-align: middle;"title="Approve">
      <i class="fa fa-check-square" aria-hidden="true" style="font-size: 16px;color: #00d97e;"></i></a>` : '---';

    proxy_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      dataContext.ManagerId == this.UserId ? `${dataContext.ManagerName} <span style=" display: inline-block;
       padding: .55em .8em;
       font-size: 90%;
        font-weight: 400;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
        background-color: #f1646c;">Self</span>` : `${dataContext.ManagerName} <span style=" display: inline-block;
        padding: .55em .8em;
        font-size: 90%;
         font-weight: 400;
         line-height: 1;
         text-align: center;
         white-space: nowrap;
         vertical-align: baseline;
         border-radius: .375rem;
         transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
         background-color: #40b03e;">Proxy</span>`;



    // proxy_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //   dataContext.ManagerId == this.UserId ? `${dataContext.ManagerName} ` : `${dataContext.ManagerName} 


    //      `;

    isSubmitted_formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      dataContext.IsPayrollSubmitted == false ? (`<span style=" display: inline-block;
             padding: .55em .8em;
             font-size: 90%;
              font-weight: 400; 
              line-height: 1;
              text-align: center;
              white-space: nowrap;
              vertical-align: baseline;
              border-radius: .375rem;
              transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
              background-color: #f1646c;">Not Submitted</span>`) : (`<span style=" display: inline-block;
              padding: .55em .8em;
              font-size: 90%;
               font-weight: 400;
               line-height: 1;
               text-align: center;
               white-space: nowrap;
               vertical-align: baseline;
               border-radius: .375rem;
               transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
               background-color: #40b03e;">Submitted</span>`);
    isSubmitted_formatter1 = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      dataContext.IsMigrated == false ? `<span style=" display: inline-block; 
                   padding: .55em .8em;
                   font-size: 90%;
                    font-weight: 400;
                    line-height: 1;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: baseline;
                    border-radius: .375rem;
                    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
                    background-color: #f1646c;">Not Submitted</span>` : `<span style=" display: inline-block;
                    padding: .55em .8em;
                    font-size: 90%;
                     font-weight: 400;
                     line-height: 1;
                     text-align: center;
                     white-space: nowrap;
                     vertical-align: baseline;
                     border-radius: .375rem;
                     transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #FFF;
                     background-color: #40b03e;">Submitted</span>`;

    reject_btnFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      `<button  class="btn btn-sm" style="line-height:15px;font-family: Roboto;font-size: 13px;font-weight: 400;text-align: center;color: #808080;border: 0"> Reject </button>`;
    approve_btnFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      `<button  class="btn btn-primary btn-sm" style="line-height:15px;font-family: Roboto;color: #FFF;background-color: #146BA2;font-size: 12px;font-weight: 500;line-height: 14px;text-align: center;"> Approve </button>`;
    ndcStatusFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {
        if (value) {
          if (value == 'No Dues') {
            return `<span style="color: #2DA05E; text-transform: uppercase; border-radius: 4px; background: #E2FEEE;font-family: Roboto;font-size: 10px; font-style: normal;font-weight: 500; padding: 5px"> ${value} </span>`
          } else if (value != 'No Dues') {
            return `<span style="color: black">${value}</span>`
          }
        }
      }
      lwd_btnFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {
        if (value) {
          let lwd = moment(value).format('YYYY-MM-DD');
          let currentDate = moment().format('YYYY-MM-DD');
          if (new Date(lwd) < new Date(currentDate)) {
            return `<span style="color: #EE5E5E";font-family: Roboto;font-size: 12px;font-style: normal;font-weight: 400;line-height: normal;>${lwd} (overdue)</span>`
          } else {
            return value;
          }

        }
      }

    for (var i = 0; i < columnDefinitionList.length; ++i) {

      //this.columnName = columnDefinitionList[i].DisplayName;


      tempColumn = {
        id: columnDefinitionList[i].Id,
        name: columnDefinitionList[i].DisplayName,
        field: columnDefinitionList[i].FieldName,
        sortable: columnDefinitionList[i].IsSortable,
        cssClass: "pointer",

        //For filter
        filterable: columnDefinitionList[i].IsFilterable,


        excludeFromHeaderMenu: !columnDefinitionList[i].ShowInHeader,
        // params: {
        //    groupFormatterPrefix: columnDefinitionList[i].Params.GroupFormatterPrefix || '', 
        //    groupFormatterSuffix: columnDefinitionList[i].Params.GroupFormatterSuffix || '' ,
        // },  
        grouping: {
          getter: columnDefinitionList[i].FieldName,
          formatter: (g) => `${Object.keys(g.rows[0]).filter((key) => { return g.rows[0][key] === g.value })[0]}: ${g.value} <span style="color:green">(${g.count} items)</span>`,
          aggregators: [],
          aggregateCollapsed: false,
          collapsed: false
        },



      }


      if (columnDefinitionList[i].IsEditable) {
        const editorType = Editors[columnDefinitionList[i].EditorType];
        const isInteger = columnDefinitionList[i].EditorType === 'integer';

        tempColumn.editor = {
          model: isInteger ? Editors.text : editorType,
          ...(isInteger && {
            validator: (value) => {
              if (isNaN(value) || (value % 1 !== 0 && value % 0.5 !== 0)) {
                alert('Please enter an integer value.');
                return { valid: false, msg: 'Please enter an integer value.' };
              }
              return { valid: true, msg: '' };
            },
          }),
        };
      }

      if (columnDefinitionList[i].IsSummarizable) {
        switch (columnDefinitionList[i].AggregatorType) {
          case 'sum': {
            tempColumn.groupTotalsFormatter = GroupTotalFormatters.sumTotals;
            break;
          }

          case 'min': {
            tempColumn.groupTotalsFormatter = GroupTotalFormatters.minTotals;
            break;
          }

          case 'max': {
            tempColumn.groupTotalsFormatter = GroupTotalFormatters.maxTotals;
            break;
          }

          case 'average': {
            tempColumn.groupTotalsFormatter = GroupTotalFormatters.avgTotals;
            break;
          }
        }
        tempColumn.params = {
          groupFormatterPrefix: columnDefinitionList[i].Params.GroupFormatterPrefix || '',
          groupFormatterSuffix: columnDefinitionList[i].Params.GroupFormatterSuffix || '',
        }
      }

      if (columnDefinitionList[i].SummaryRequiredInGrouping) {

        for (var j = 0; j < columnDefinitionList[i].GroupAggregatorColumnAndType.length; ++j) {
          switch (columnDefinitionList[i].GroupAggregatorColumnAndType[j].Type) {
            case 'sum': {
              //var temp = new Aggregators.Sum(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              tempColumn.grouping.aggregators.push(new Aggregators.Sum(columnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'min': {
              //var temp = new Aggregators.Min(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              tempColumn.grouping.aggregators.push(new Aggregators.Avg(columnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'max': {
              //var temp = new Aggregators.Max(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              tempColumn.grouping.aggregators.push(new Aggregators.Max(columnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'average': {
              //var temp = new Aggregators.Avg(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              tempColumn.grouping.aggregators.push(new Aggregators.Avg(columnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

          }
        }
      }

      if (columnDefinitionList[i].Width) {
        tempColumn.width = columnDefinitionList[i].Width;
        tempColumn.maxWidth = columnDefinitionList[i].Width
      }

      // var RequiredTimeCardStatus = [];
      // this.preTMSelectedIds = [];
      // this.timecardStatus.forEach(element => {
      //   RequiredTimeCardStatus.push({
      //     value: element.name,
      //     label: element.name
      //   });
      //   element.id != 401 && this.preTMSelectedIds.push(element.name);
      // });

      // console.log('RequiredTimeCardStatus', RequiredTimeCardStatus);
      // console.log('this.preTMSelectedIds', this.preTMSelectedIds);

      if (columnDefinitionList[i].IsFilterable) {

        let instanceLoaderForFilterHandler = new InstanceLoader(window,);

        if (dataset === undefined || dataset === null) {
          dataset = [];
        }

        console.log('dataset hhhhhhhhhhhhhhhhh : ::::', dataset);

        if (columnDefinitionList[i].IsCustomFilter !== undefined && columnDefinitionList[i].IsCustomFilter !== null &&
          columnDefinitionList[i].IsCustomFilter) {

          // let filterHandler =  instanceLoaderForFilterHandler.getInstance(columnDefinitionList[i].FilterType);
          // let componentInstance = this.getComponent(columnDefinitionList[i].CustomFilterComponentName);  

          // console.log("Instances ::" , filterHandler , componentInstance);

          // if(filterHandler !== undefined && filterHandler !== null && componentInstance !== undefined &&
          //   componentInstance !== null){
          //   tempColumn.filter = {
          //     model : filterHandler,
          //     params: {
          //       component: componentInstance,
          //       angularUtilService: this.angularUtilService
          //     }
          //   }
          // }

          if (columnDefinitionList[i].CustomFilterComponentName === "CommaSeparatedStringsFilterComponent") {
            tempColumn.filter = {
              collection: dataset,
              model: new CommaSeparatedStringFilterHandler(),
              params: {
                component: CommaSeparatedStringsFilterComponent,
                angularUtilService: this.angularUtilService
              }
            }

          }
        }
        else {
          tempColumn.filter = {
            collection: dataset,
            customStructure: {
              value: columnDefinitionList[i].FieldName,
              label: columnDefinitionList[i].FieldName
            },
            model: Filters[columnDefinitionList[i].FilterType]
          }
        }

        // if (columnDefinitionList[i].Id == 'IsPayrollSubmitted') {
        //   tempColumn.filter = {
        //     collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }],
        //     model: Filters[columnDefinitionList[i].FilterType]
        //   }
        // }
        // if (columnDefinitionList[i].Id == 'IsMigrated') {
        //   tempColumn.filter = {
        //     collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }],
        //     model: Filters[columnDefinitionList[i].FilterType]
        //   }
        // }
      }


      if (columnDefinitionList[i].Formatter !== undefined && columnDefinitionList[i].Formatter !== null) {
        if (columnDefinitionList[i].IsGridFormatter) {
          if (this.gridFormatters[columnDefinitionList[i].Formatter] !== undefined &&
            this.gridFormatters[columnDefinitionList[i].Formatter] !== null)
            tempColumn.formatter = this.gridFormatters[columnDefinitionList[i].Formatter];
          tempColumn.excludeFromExport = true;
        }
      }

      if (columnDefinitionList[i].Id === 'edit') {
        tempColumn.formatter = Formatters.editIcon;
        tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id === 'delete') {
        tempColumn.formatter = Formatters.deleteIcon;
        tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id === 'preview') {
        tempColumn.formatter = previewFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id === 'approve') {
        tempColumn.formatter = approveFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id === 'reject') {
        tempColumn.formatter = rejectFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id === 'log') {
        tempColumn.formatter = viewLogFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id === 'docs') {
        tempColumn.formatter = docsFormatter,
          tempColumn.excludeFromExport = true;
      }

      if (columnDefinitionList[i].RouteLink != null && columnDefinitionList[i].Id !== 'edit') {
        tempColumn.formatter = hyperlinkFormatter;
      }
      if (columnDefinitionList[i].FunctionName != null && (columnDefinitionList[i].Id !== 'edit' && columnDefinitionList[i].Id != 'docs'
        && columnDefinitionList[i].Id != 'log' && columnDefinitionList[i].Id != 'reject' && columnDefinitionList[i].Id != 'hold' && columnDefinitionList[i].Id != 'checkStatus' && columnDefinitionList[i].Id != 'info' && columnDefinitionList[i].Id != 'approve' && columnDefinitionList[i].Id != 'preview' &&
        columnDefinitionList[i].Id != 'delete' && columnDefinitionList[i].Id != 'approve_req' && columnDefinitionList[i].Id != 'regularize_req' && columnDefinitionList[i].Id != 'decline_req')) {
        tempColumn.formatter = hyperlinkFormatter;
      }

      if (columnDefinitionList[i].Id == 'hold') {
        tempColumn.formatter = holdFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'checkStatus') {
        tempColumn.formatter = checkStatusFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'info') {
        tempColumn.formatter = Formatters.infoIcon,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'decline_req') {
        tempColumn.formatter = decline_reqFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'approve_req') {
        tempColumn.formatter = approve_reqFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'regularize_req') {
        tempColumn.formatter = editbtnFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'IsMakeanOffer') {
        tempColumn.formatter = yesorno_formatter,
          tempColumn.excludeFromExport = true;
      }

      if (columnDefinitionList[i].Id == 'AppliedFrom') {
        tempColumn.formatter = this.DateFormatter
        // tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'AppliedTill') {
        tempColumn.formatter = this.DateFormatter
        // tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'AppliedOn') {
        tempColumn.formatter = this.DateFormatter
        // tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'LeaveRequestStatus') {
        tempColumn.formatter = highlightingFormatter
        // tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'AppliedUnits') {
        tempColumn.formatter = info_formatter
        // tempColumn.excludeFromExport = true;
      }

      if (columnDefinitionList[i].Id == 'ManagerName') {
        if (environment.environment.IsProxyIndicationRequired) {
          tempColumn.formatter = proxy_formatter
        }
        // tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'IsPayrollSubmitted') {
        tempColumn.formatter = isSubmitted_formatter
        // tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'IsMigrated') {
        tempColumn.formatter = isSubmitted_formatter1
        // tempColumn.excludeFromExport = true;
      }
      // if (columnDefinitionList[i].FunctionName != null && columnDefinitionList[i].Id !== 'edit' && columnDefinitionList[i].Id === 'docs' && columnDefinitionList[i].Id === 'log' && columnDefinitionList[i].Id === 'approve' && columnDefinitionList[i].Id === 'reject') {
      //    tempColumn.formatter = hyperlinkFormatter;
      // }
      if (columnDefinitionList[i].Id == 'reject_btnFormatter') {
        tempColumn.formatter = reject_btnFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'approve_btnFormatter') {
        tempColumn.formatter = approve_btnFormatter,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'NDCStatus') {
        tempColumn.formatter = ndcStatusFormatter
        tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'LWD') {
        tempColumn.formatter = lwd_btnFormatter
        tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'DisplayTransactionStatus') {
        tempColumn.formatter = displayTransactionStatusFormatter
        tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'decline_reqFormatter_withValue') {
        tempColumn.formatter = decline_reqFormatter_withValue,
          tempColumn.excludeFromExport = true;
      }
      if (columnDefinitionList[i].Id == 'approve_reqFormatter_withValue') {
        tempColumn.formatter = approve_reqFormatter_withValue,
          tempColumn.excludeFromExport = true;
      }


      columnDefinition.push(tempColumn);
    }
    return columnDefinition;
  }

  //Columns
  setDynamicColumns(columnList: string[], dataset: any = null): Column[] {
    let columnDefinition: Column[] = [];
    let tempColumn: Column;


    for (var i = 0; i < columnList.length; ++i) {

      //this.columnName = columnDefinitionList[i].DisplayName;


      tempColumn = {
        id: columnList[i],
        name: columnList[i],
        field: columnList[i],
        sortable: true,
        width: 0,

        //For filter
        filterable: true,

        excludeFromHeaderMenu: false,
        // params: {
        //    groupFormatterPrefix: columnDefinitionList[i].Params.GroupFormatterPrefix || '', 
        //    groupFormatterSuffix: columnDefinitionList[i].Params.GroupFormatterSuffix || '' ,
        // },  
        grouping: {
          getter: columnList[i],
          formatter: (g) => `${Object.keys(g.rows[0]).filter((key) => { return g.rows[0][key] === g.value })[0]}: ${g.value} <span style="color:green">(${g.count} items)</span>`,
          aggregators: [],
          aggregateCollapsed: false,
          collapsed: false
        },

      }

      // if(dataset != null){
      //   tempColumn.filter = {
      //     collection : dataset,
      //     customStructure : {
      //       value : columnDefinitionList[i],
      //       label : columnDefinitionList[i]
      //     },
      //     model : Filters[columnDefinitionList[i].FilterType]
      //   }
      // }

      if (columnList[i] === 'edit') {
        tempColumn.formatter = Formatters.editIcon;
        tempColumn.excludeFromExport = true;
      }
      if (columnList[i] === 'delete') {
        tempColumn.formatter = Formatters.deleteIcon;
        tempColumn.excludeFromExport = true;
      }

      columnDefinition.push(tempColumn);
    }
    return columnDefinition;
  }

  //Set Grid options

  setGridOptions(gridConfiguration: GridConfiguration): GridOption {
    let gridOptions: GridOption = {};
    let pagination = {
      pageSizes: [10, 15, 20, 25, 50, 75],
      pageSize: 15,
    };


    gridOptions = {

      //General
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: gridConfiguration.EnableColumnReArrangement,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: true,
      //forceFitColumns : true,
      enableAutoSizeColumns: true,
      enableAutoTooltip: true,

      //For Footer Summary
      createFooterRow: true,
      showFooterRow: gridConfiguration.IsSummaryRequired,
      footerRowHeight: 30,

      //For Grouping
      createPreHeaderPanel: true,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 40,

      //For Pinning Rows and columns
      frozenRow: gridConfiguration.PinnedRowCount,
      frozenColumn: gridConfiguration.PinnedColumnCount,
      frozenBottom: gridConfiguration.PinRowFromBottom,
      presets: {}
      // dataset
      //  presets: {
      //   filters: [{ columnId: 'PayStatus', searchTerms: this.preTMSelectedIds, operator: 'IN' }]
      // },

    };

    if (gridConfiguration.IsPaginationRequired === true) {
      gridOptions.enablePagination = true;
      gridOptions.pagination = pagination;
      gridOptions.showFooterRow = false;
      gridOptions.frozenRow = -1;
      gridOptions.frozenColumn = -1;
      gridOptions.frozenBottom = false;
    }

    if (gridConfiguration.PinnedRowCount >= 0) {
      gridOptions.showFooterRow = false;
    }

    // if(gridConfiguration.DisplayFilterByDefault === false){
    //   gridOptions.showHeaderRow = false;
    // }

    if (gridConfiguration.IsGroupingEnabled) {
      gridOptions.enableDraggableGrouping = true;
      gridOptions.showPreHeaderPanel = true;
      gridOptions.frozenRow = -1;
      gridOptions.frozenColumn = -1;
      gridOptions.frozenBottom = false;
    }

    if (gridConfiguration.RowSelectionCheckBoxRequired) {
      gridOptions.enableCheckboxSelector = true;
      gridOptions.enableRowSelection = true;

      if (gridConfiguration.RowSelectionType === RowSelectionType.Multiple) {
        gridOptions.rowSelectionOptions = {
          selectActiveRow: false
        }
      }
    }


    return gridOptions;

  }

  fillSearchElementFromLocalStorage(searchElementList: SearchElement[]): boolean {

    let commonSearchElementsString: string = sessionStorage.getItem('CommonSearchCriteria');
    let commonSearchElements: SearchElement[];

    if (commonSearchElementsString !== undefined && commonSearchElementsString !== null && commonSearchElementsString !== '') {
      commonSearchElements = JSON.parse(commonSearchElementsString);
    }
    else {
      return false;
    }

    commonSearchElements.forEach(commonSearchElement => {
      // searchElemetList.forEach(searchElement => {
      //   if (commonSearchElement.FieldName === searchElement.FieldName) {
      //     searchElement.Value = searchElementValues.Value;
      //     searchElement.ReadOnly = searchElementValues.ReadOnly;
      //   }
      // })

      let searchElement = searchElementList.find(x => x.FieldName.toLowerCase() == commonSearchElement.FieldName.toLowerCase());

      if (searchElement !== undefined && searchElement !== null) {
        searchElement.Value = commonSearchElement.Value;
        searchElement.DropDownList = commonSearchElement.DropDownList;
        searchElement.ReadOnly = commonSearchElement.ReadOnly;
      }

    })
    return true;
  }

  fillSearchElements(FromSearchElementList: SearchElement[], ToSearchElementList: SearchElement[]) {
    FromSearchElementList.forEach(fromSearchElement => {
      ToSearchElementList.forEach(toSearchElement => {
        let fromField = fromSearchElement.FieldName;
        fromField = fromField.startsWith("@") ? fromField.substring(1) : fromField;
        let toField = toSearchElement.FieldName;
        toField = toField.startsWith("@") ? toField.substring(1) : fromField;
        if (fromSearchElement.FieldName.toLowerCase() === toSearchElement.FieldName.toLowerCase()) {
          toSearchElement.Value = fromSearchElement.Value;
          toSearchElement.DropDownList = fromSearchElement.DropDownList;
          toSearchElement.ReadOnly = fromSearchElement.ReadOnly;
        }
      })
    })
  }

  fillSearchElementsWithoutDropdown(FromSearchElementList: SearchElement[], ToSearchElementList: SearchElement[]) {
    FromSearchElementList.forEach(fromSearchElement => {
      ToSearchElementList.forEach(toSearchElement => {
        let fromField = fromSearchElement.FieldName;
        fromField = fromField.startsWith("@") ? fromField.substring(1) : fromField;
        let toField = toSearchElement.FieldName;
        toField = toField.startsWith("@") ? toField.substring(1) : fromField;
        if (fromSearchElement.FieldName.toLowerCase() === toSearchElement.FieldName.toLowerCase()) {
          toSearchElement.Value = fromSearchElement.Value;
        }
      })
    })
  }

  fillSearchElementsForSME(searchElementList: SearchElement[]) {
    let clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
    let clientIdSME = this.sessionService.getSessionStorage("default_SME_ClientId");
    let clientcontractSME = JSON.parse(this.sessionService.getSessionStorage("SME_ClientContract"));
    let clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");

    let clientDropDownList: any[] = [];
    let clientcontractDropDownList: any[] = [];

    if (clientSME !== undefined && clientSME !== null) {
      clientDropDownList.push(clientSME);

      let clientSearchElement = searchElementList
        .find(x => (x.FieldName.toLowerCase() === '@clientid' || x.FieldName.toLowerCase() === 'clientid'));

      if (clientSearchElement !== undefined && clientSearchElement !== null) {
        clientSearchElement.Value = clientSME.Id;
        clientSearchElement.DropDownList = clientDropDownList;
        clientSearchElement.IsIncludedInDefaultSearch = false;
        clientSearchElement.ReadOnly = true;
      }
    }

    if (clientcontractSME !== undefined && clientcontractSME !== null) {
      clientcontractDropDownList.push(clientcontractSME);

      let clientcontractSearchElement = searchElementList
        .find(x => (x.FieldName.toLowerCase() === '@clientcontractid' || x.FieldName.toLowerCase() === 'clientcontractid'));

      if (clientcontractSearchElement !== undefined && clientcontractSearchElement !== null) {
        clientcontractSearchElement.Value = clientcontractSME.Id;
        clientcontractSearchElement.DropDownList = clientcontractDropDownList;
        clientcontractSearchElement.IsIncludedInDefaultSearch = false;
        clientcontractSearchElement.ReadOnly = true;
        clientcontractSearchElement.ParentDependentReadOnly = [false];
      }

    }



  }

  fillSearchElementsForSecurityKeys(searchElementList: SearchElement[]) {
    let loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object

    for (let searchElement of searchElementList) {

      if (searchElement.FieldName.toLowerCase() == 'userid' || searchElement.FieldName.toLowerCase() == '@userid') {
        searchElement.Value = loginSessionDetails.UserSession.UserId;
        searchElement.IsIncludedInDefaultSearch = false;
      }

      else if (searchElement.FieldName.toLowerCase() == 'roleid' || searchElement.FieldName.toLowerCase() == '@roleid') {
        searchElement.Value = this.sessionService.getSessionStorage('RoleId');
        searchElement.IsIncludedInDefaultSearch = false;
      }
    }

  }

  getSearchElementFromSecurityKeys(securityKeys: string[][], dataSource: DataSource) {

    let loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object

    let searchElements: SearchElement[] = [];

    for (let i = 0; i < securityKeys.length; ++i) {
      let securityKeyValue: any = loginSessionDetails;

      if (securityKeys[i][0] === 'UserId') {
        securityKeyValue = loginSessionDetails.UserSession.UserId;
      }
      else if (securityKeys[i][0] === 'RoleId') {
        securityKeyValue = this.sessionService.getSessionStorage('RoleId');
      }
      else {
        for (let j = 0; j < securityKeys[i].length; ++j) {

          if (securityKeys[i][j] !== undefined && securityKeyValue !== undefined) {
            securityKeyValue = securityKeyValue[securityKeys[i][j]]
          }
          else {
            securityKeyValue = undefined;
            break;
          }

        }
      }


      if (securityKeyValue !== undefined) {
        let searchElement: SearchElement = new SearchElement();

        if (dataSource.Type == DataSourceType.View) {
          searchElement.FieldName = securityKeys[i][(securityKeys[i].length - 1)];
        }
        else {
          searchElement.FieldName = ("@" + securityKeys[i][(securityKeys[i].length - 1)]);
        }

        searchElement.Value = securityKeyValue;

        searchElements.push(searchElement);
      }
    }

    return searchElements;
  }

  getComponent(componentName: string) {
    const factories = Array.from(this.resolver['_factories'].keys());
    const factoryClass = <Type<any>>factories.find((x: any) => x.name === componentName);
    const factory = this.resolver.resolveComponentFactory(factoryClass);
    // const compRef = this.vcRef.createComponent(factory);

    return factory;
  }

  saveColumnFilterSettingsInLocalStorage(columnFilters: any) {
    let ColumnFilters: ColumnFilter[] = columnFilters;

    let columnFilterSettingsList: ColumnFilterSettings[] = [];

    // let oldColumnSettingsList : ColumnSettings[] = JSON.parse(localStorage.getItem(this.CommonColumnSettings));

    if (ColumnFilters === undefined || ColumnFilters === null) {
      ColumnFilters = [];
    }

    for (let columnFilter of ColumnFilters) {
      let columnFilterSettings = new ColumnFilterSettings();

      columnFilterSettings.Id = columnFilter.columnId;
      columnFilterSettings.IsFiltered = true;
      columnFilterSettings.FilterValue = columnFilter.searchTerms;
      columnFilterSettings.Operator = columnFilter.operator;


      columnFilterSettingsList.push(columnFilterSettings);
    }

    // console.log("Saved filters ::" , columnFilters , columnFilterSettingsList);
    sessionStorage.setItem(this.CommonColumnFilterSettings, JSON.stringify(columnFilterSettingsList));

  }

  saveColumnSortingSettingsInLocalStorage(columnSortings: any) {
    let ColumnSortings: CurrentSorter[] = columnSortings;

    let columnSortingSettingsList: ColumnSortingSettings[] = [];

    // let oldColumnSettingsList : ColumnSettings[] = JSON.parse(localStorage.getItem(this.CommonColumnSettings));

    if (ColumnSortings === undefined || ColumnSortings === null) {
      ColumnSortings = [];
    }

    for (let columnSorting of ColumnSortings) {
      let columnSortingSettings = new ColumnSortingSettings();

      columnSortingSettings.Id = columnSorting.columnId.toString();
      columnSortingSettings.IsSorted = true;
      columnSortingSettings.SortingDirection = columnSorting.direction;

      columnSortingSettingsList.push(columnSortingSettings);
    }

    // console.log("Saved Sortings ::" , ColumnSortings , columnSortingSettingsList);
    sessionStorage.setItem(this.CommonColumnSortingSettings, JSON.stringify(columnSortingSettingsList));

  }

  setColumnSettings(angularGridInstance: AngularGridInstance) {

    // Update FIlters
    let columnFilterSettingsString = sessionStorage.getItem(this.CommonColumnFilterSettings)
    let columnFilterSettingsList: ColumnFilterSettings[] = [];

    // console.log("columnfilter string"  , columnFilterSettingsString);
    if (columnFilterSettingsString !== undefined && columnFilterSettingsString !== null) {
      columnFilterSettingsList = JSON.parse(columnFilterSettingsString);
    }

    let columnFilters: CurrentFilter[] = [];

    for (let columnFilterSettings of columnFilterSettingsList) {
      let columnFilter: CurrentFilter = {
        columnId: columnFilterSettings.Id,
        operator: columnFilterSettings.Operator as OperatorString,
        searchTerms: columnFilterSettings.FilterValue
      }

      columnFilters.push(columnFilter);

    }

    angularGridInstance.filterService.updateFilters(columnFilters)


    // Update Sorting
    let columnSortingSettingsString = sessionStorage.getItem(this.CommonColumnSortingSettings)
    let columnSortingSettingsList: ColumnSortingSettings[] = [];

    // console.log("columnSorting string"  , columnSortingSettingsString);
    if (columnSortingSettingsString !== undefined && columnSortingSettingsString !== null) {
      columnSortingSettingsList = JSON.parse(columnSortingSettingsString);
    }

    let columnSortings: CurrentSorter[] = [];

    for (let columnSortingSettings of columnSortingSettingsList) {
      let columnSorting: CurrentSorter = {
        columnId: columnSortingSettings.Id,
        direction: columnSortingSettings.SortingDirection as SortDirectionString
      }

      columnSortings.push(columnSorting);

    }

    angularGridInstance.sortService.updateSorting(columnSortings);

  }

  updateCollection(columnDef: Column[], collection) {
    for (let column of columnDef) {
      if (column.filterable) {
        column.filter.collection = collection;
      }
    }
  }

  updateFilterCollection(slickgridColumns: Column[], columnDefinitionList: ColumnDefinition[], dataset: any[]) {

    for (let i = 0; i < columnDefinitionList.length; ++i) {

      const slickGridColumn = slickgridColumns.find((column: Column) => column.id === columnDefinitionList[i].Id);


      if (columnDefinitionList[i].IsCustomFilter !== undefined && columnDefinitionList[i] !== null &&
        columnDefinitionList[i].IsCustomFilter) {

        // let filterHandler =  instanceLoaderForFilterHandler.getInstance(columnDefinitionList[i].FilterType);
        // let componentInstance = this.getComponent(columnDefinitionList[i].CustomFilterComponentName);  

        // console.log("Instances ::" , filterHandler , componentInstance);

        // if(filterHandler !== undefined && filterHandler !== null && componentInstance !== undefined &&
        //   componentInstance !== null){
        //   tempColumn.filter = {
        //     model : filterHandler,
        //     params: {
        //       component: componentInstance,
        //       angularUtilService: this.angularUtilService
        //     }
        //   }
        // }

        if (columnDefinitionList[i].CustomFilterComponentName === "CommaSeparatedStringsFilterComponent") {
          slickGridColumn.filter = {
            collection: dataset,
            model: new CommaSeparatedStringFilterHandler(),
            params: {
              component: CommaSeparatedStringsFilterComponent,
              angularUtilService: this.angularUtilService
            }
          }

        }
      }
      else {

        //Getting distint values from dataset
        const distintCollection: any[] = dataset.filter((notCheckedDataElement, notCheckedIndex, array) =>
          array.findIndex((checkedDataElement) =>
            notCheckedDataElement[columnDefinitionList[i].FieldName] === checkedDataElement[columnDefinitionList[i].FieldName]) === notCheckedIndex
        );

        slickGridColumn.filter = {
          collection: distintCollection,
          customStructure: {
            value: columnDefinitionList[i].FieldName,
            label: columnDefinitionList[i].FieldName
          },
          model: Filters[columnDefinitionList[i].FilterType]
        }
      }
    }
  }

}





