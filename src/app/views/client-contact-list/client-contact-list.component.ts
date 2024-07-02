import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularGridInstance, Column, Formatters, GridOption, OnEventArgs } from "angular-slickgrid";
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ClientContactComponent } from 'src/app/shared/modals/client-contact/client-contact.component';
import { HeaderService } from 'src/app/_services/service/header.service';
import { ClientContactModel, ClientContactLocationMapping, ClientList } from 'src/app/_services/model/ClientContactModelList';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ClientContactService } from 'src/app/_services/service';

@Component({
  selector: 'app-client-contact-list',
  templateUrl: './client-contact-list.component.html',
  styleUrls: ['./client-contact-list.component.css']
})
export class ClientContactListComponent implements OnInit, OnDestroy {
  panelTitle: any;
  spinner: boolean = true;
  UserId: any;
  identity: number = 0;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  gridObj1: any;
  deleteColumn: string;
  ClientContactForm: FormGroup;
  ClientContactModel: ClientContactModel = {} as any;
  ClientContactLocationMapping: ClientContactLocationMapping = {} as any;
  clientList: ClientList[] = [];
  _loginSessionDetails: LoginResponses;
  RoleId: any;
  getClientContactList: any;
  private stopper: EventEmitter<any> = new EventEmitter();

  constructor(
    private alertService: AlertService,
    public ClientContactService: ClientContactService,
    public modalService: NgbModal,
    private headerService: HeaderService,
    private sessionService: SessionStorage
  ) {}

  ngOnInit() {
    this.headerService.setTitle('Client Contact');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;

    this.columnDefinitions = [
      { id: 'client', name: 'Client', field: 'ClientName', formatter: Formatters.uppercase, sortable: true, filterable: true },
      { id: 'name', name: 'Client Contact Name', field: 'Name', sortable: true, filterable: true },
      { id: 'designation', name: 'Designation', field: 'Designation', sortable: true, filterable: true },
      { id: 'mobile', name: 'Mobile', field: 'PrimaryMobile', sortable: true, filterable: true },
      { id: 'email', name: 'Email', field: 'PrimaryEmail', sortable: true, filterable: true },
      { id: 'StatusCode', name: 'Status', field: 'StatusCode', cssClass: 'right-align', sortable: true },
      {
        id: 'edit',
        field: 'id',
        excludeFromExport: true,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30
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
    this.initial_getClientContact_load();
  }

  newButtonContactClick() {
    const modalRef = this.modalService.open(ClientContactComponent);
    modalRef.result.then((result) => {
      console.log(result);
      if (result != 'Modal Closed') {
        this.initial_getClientContact_load();
        return;
      }    
    }).catch((error) => {
      console.log(error);
    });
  }
 
  initial_getClientContact_load() {
    this.spinner = true;
    let api1 = this.ClientContactService.getClientContact().pipe(takeUntil(this.stopper));
    let api2 = this.ClientContactService.getUserMappedClientList(this.RoleId, this.UserId).pipe(takeUntil(this.stopper));
    const all$ = Observable.combineLatest(api1, api2);

    all$.subscribe({ next: latestValues => {
      const [api1Resp, api2Resp] = latestValues;
      this.getClientContactList = api1Resp.dynamicObject;
      this.clientList = api2Resp.dynamicObject;

     this.dataset = (this.getClientContactList.filter((clientContact: any)=> this.clientList.some(a => a.Id == clientContact.ClientID)) || []).map((clientContact: any)=>{
        if(this.clientList.some(a => a.Id == clientContact.ClientID)){
          return {
            ...clientContact,
            ClientName : this.clientList.find(a => a.Id == clientContact.ClientID).Name,
            PrimaryMobile : clientContact.LstClientContact.PrimaryMobile,
            PrimaryEmail : clientContact.LstClientContact.PrimaryEmail,
            StatusCode : clientContact.Status == 0 ? "In-Active" : "Active"
          } 
        };
      });
      this.spinner = false;
      console.log(this.dataset)
    }, error: error =>  this.spinner = false});
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
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.Name);
    }

  }

  editButtonClick(id: number) {
    this.identity = + id;
    let i: any = this.dataset.filter(item => item.Id == id);
    const modalRef = this.modalService.open(ClientContactComponent);
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.jsonObj = i;

    modalRef.result.then((result) => {
      let isSameResult = false;
      isSameResult = this.dataset.find((a) => a.Id == result.Id) != null ? true : false;
      console.log(result, isSameResult, this.dataset.find((a) => a.Id == result.Id))
      if (isSameResult) {
        result.ClientName = this.clientList.find(a => a.Id == result.ClientID).Name,
        result.PrimaryMobile = result.LstClientContact.PrimaryMobile;
        result.PrimaryEmail = result.LstClientContact.PrimaryEmail;
        result.StatusCode = result.Status == 0 ? "In-Active" : "Active";
        this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);
      } else {
        result.ClientName = this.clientList.find(a => a.Id == result.ClientID).Name,
        result.PrimaryMobile = result.LstClientContact.PrimaryMobile;
        result.PrimaryEmail = result.LstClientContact.PrimaryEmail;
        result.StatusCode = result.Status == 0 ? "In-Active" : "Active";
        this.angularGrid.gridService.addItemToDatagrid(result);
      }
      this.initial_getClientContact_load();
    });
  }

  confirmDeleteid(id: number, DeleteColumnvalue: string) {
    this.identity = + id;
    this.deleteColumn = DeleteColumnvalue;
    $('#modaldeleteconfimation').modal('show');
  }

  delete() {
    let deletContent: ClientContactModel = {} as any;
    deletContent = this.dataset.filter(a => a.Id == this.identity)[0];
    deletContent.Modetype = UIMode.Delete;
    this.ClientContactService.deleteClientContact(JSON.stringify(deletContent)).subscribe(response => {
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

  ngOnDestroy() {
    this.stopper.next();
    this.stopper.complete();
  }


}
