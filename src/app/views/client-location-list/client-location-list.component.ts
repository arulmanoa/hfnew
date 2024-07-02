import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientLocationComponent } from 'src/app/shared/modals/client-location/client-location.component';
import { HeaderService } from 'src/app/_services/service/header.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ClientLocationService } from '../../_services/service/clientlocation.service';
import { ClientLocationModel, ClientList } from 'src/app/_services/model/ClientLocationAllList';
import { UIMode } from '../../_services/model/Common/BaseModel';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from '../../_services/service/alert.service';
import { SessionStorage } from '../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../_services/configs/app.config'; // app config 
import { LoginResponses } from '../../_services/model/Common/LoginResponses';

import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
} from 'angular-slickgrid';
import { element } from '@angular/core/src/render3';
import * as _ from 'lodash';
@Component({
  selector: 'app-client-location-list',
  templateUrl: './client-location-list.component.html',
  styleUrls: ['./client-location-list.component.css']
})
export class ClientLocationListComponent implements OnInit {

  panelTitle: any;
  spinner: boolean = false;
  UserId: any;
  RoleId: any;
  identity: number = 0;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  gridObj1: any;
  deleteColumn: string;
  ClientLocationForm: FormGroup;
  _loginSessionDetails: LoginResponses;
  ClientLocationModel: ClientLocationModel = {} as any;
  clientList: ClientList[] = [];
  BusinessType: any

  constructor(private alertService: AlertService, private fb: FormBuilder, public ClientLocationService: ClientLocationService, public modalService: NgbModal, private headerService: HeaderService, private sessionService: SessionStorage,) { }

  newButtonLocationClick() {

    const modalRef = this.modalService.open(ClientLocationComponent);
    this.panelTitle = "Add New Client Location";
    modalRef.result.then((result) => {
      console.log(result);
      
      if (result != 'Modal Closed') {
        this.initial_getClientLocation_load();
        return;
      }

      // result.StatusCode = result.Status == 0 ? "In-Active" : "Active";
      // result.ClientName = this.clientList.find(a => a.Id == result.ClientID).Name,
      //   result.id = result.Id;
      // this.angularGrid.gridService.addItemToDatagrid(result);
      // this.initial_getClientLocation_load();
    }).catch((error) => {
      console.log(error);
    });
  }

  ngOnInit() {
    this.spinner = true;
    this.headerService.setTitle('Client Location');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;

    this.columnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      { id: 'client', name: 'Client', field: 'ClientName', formatter: Formatters.uppercase, sortable: true, filterable: true },
      { id: 'code', name: 'Location Code', field: 'LocationCode', formatter: Formatters.uppercase, sortable: true, filterable: true },
      { id: 'Name', name: 'Location Name', field: 'LocationName', sortable: true, filterable: true },
      { id: 'StatusCode', name: 'Status', field: 'StatusCode', cssClass: 'right-align', sortable: true },
      {
        id: 'edit',
        field: 'id',

        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          // this.angularGrid.gridService.highlightRow(args.row, 1500);
          // this.angularGrid.gridService.setSelectedRow(args.row);
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
          console.log(args);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          this.angularGrid.gridService.highlightRow(args.row, 1500);
          this.angularGrid.gridService.setSelectedRow(args.row);
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

    this.initial_getClientLocation_load();

    //  this.ClientLocationForm = this.fb.group({
    //    code: ['', [Validators.required, Validators.minLength(2)]],
    //    name: ['', Validators.required],
    //  });


  }
  do_Refresh() {
    this.initial_getClientLocation_load();
  }


  initial_getClientLocation_load() {
    try {

      this.spinner = true;
      this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

      console.log("BusinessType", this.BusinessType);
      this.ClientLocationService.getUserMappedClientLocationList(this.RoleId, this.UserId).subscribe(response => {

        console.log(response);
        this.ClientLocationService.getUserMappedClientList(this.RoleId, this.UserId).subscribe(response2 => {
          this.dataset = response.dynamicObject;

          console.log(response2);
          this.clientList = response2.dynamicObject;


          if (this.BusinessType !== 3) {


            this.dataset = this.dataset.filter((item) => item.ClientID == this.sessionService.getSessionStorage('default_SME_ClientId'));
            this.columnDefinitions = this.columnDefinitions.filter((item) => item.id !== 'client');//hide the client column in the grid

          }

          try {


            this.dataset.forEach(element => {
              element['ClientName'] = this.clientList.find(a => a.Id == element.ClientID) != undefined ? this.clientList.find(a => a.Id == element.ClientID).Name : '---',
                element["StatusCode"] = element.Status == 0 ? "In-Active" : "Active";
            });
            this.spinner = false;
          } catch (error) {
            this.spinner = false;
          }
          console.log(this.dataset.length);

        }, (error) => {
          this.spinner = false;
        });
        this.spinner = false;
      }, (error) => {
        this.spinner = false;
      });


    } catch (error) {
      this.spinner = false;
    }


  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};

  }


  onCellClicked(e, args) {

    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    //call edit popup
    if (metadata.columnDef.id === 'edit') {
      this.editButtonClick(metadata.dataContext.Id);
    }
    //call delete popup
    else if (metadata.columnDef.id === 'delete') {
      debugger
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.LocationCode);
    }

  }

  editButtonClick(id: number) {
    // if (this._authorizationGuard.CheckAcess("Countries", "ViewEdit")) {
    //   return;
    // }
    debugger
    this.panelTitle = "Edit Client Location";
    this.identity = + id;

    let i: any = this.dataset.filter(item => item.Id == id);
    //let clientId= i[0].ClientID;
    //i.ClientName=this.clientList.find(a=>a.Id == clientId).Name;
    const modalRef = this.modalService.open(ClientLocationComponent);
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.jsonObj = i;
    modalRef.result.then((result) => {
      let isSameResult = false;
      isSameResult = _.find(this.dataset, (a) => a.Id == result.Id) != null ? true : false;

      if (isSameResult) {
        result.StatusCode = result.Status == 0 ? "In-Active" : "Active";
        result.ClientName = this.clientList.find(a => a.Id == result.ClientID).Name,
          this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

      } else {
        result.StatusCode = result.Status == 0 ? "In-Active" : "Active";
        result.ClientName = this.clientList.find(a => a.Id == result.ClientID).Name,
          this.angularGrid.gridService.addItemToDatagrid(result);
      }

    });

    //$('#modalpopupGenericMaster').modal('show');
  }

  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }
  delete() {
    let deletContent: ClientLocationModel = {} as any;
    deletContent = this.dataset.filter(a => a.Id == this.identity)[0];
    deletContent.Modetype = UIMode.Delete;
    this.ClientLocationService.deleteClientLocation(JSON.stringify(deletContent)).subscribe(response => {
      if (response.Status) {
        this.alertService.showSuccess(response.Message);

        this.angularGrid.gridService.deleteDataGridItemById(this.identity);
      } else {
        this.alertService.showWarning(response.Message);
      }
      $('#modaldeleteconfimation').modal('hide');

    }, (error) => {
      $('#modaldeleteconfimation').modal('hide');
    });
  }

}
