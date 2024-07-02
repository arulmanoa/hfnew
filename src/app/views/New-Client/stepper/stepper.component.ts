import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import * as _ from 'lodash';
import {ClientService} from 'src/app/_services/service/client.service';
import {ClientList,ClientLocationModel} from 'src/app/_services/model/ClientLocationAllList';
import {ClientLocationService} from 'src/app/_services/service/clientlocation.service';
import {ClientContractService} from 'src/app/_services/service/clientContract.service';
import { ClientContactService } from 'src/app/_services/service/clientcontact.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ClientLocationComponent } from 'src/app/views/client-location/client-location.component';
// import { ClientContactComponent } from 'src/app/views/client-contact/client-contact.component';
import { HeaderService } from 'src/app/_services/service/header.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/_services/service/alert.service';
import {NewContractComponent} from 'src/app/shared/components/contract-new/contract-new.component';
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
import { id } from 'date-fns/locale';
import { ClientLocationComponent } from 'src/app/shared/modals/client-location/client-location.component';
import { ClientContactComponent } from 'src/app/shared/modals/client-contact/client-contact.component';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit {
@Input() clientInfo:any=[];
@Input() clientBaseInfo:any=[];
@Output() clientCreated = new EventEmitter<any>();
@Input()  contractInfo:any=[];
 @Input() jsonObj:any;
 @Output() contractCreated=new EventEmitter<any>();
 @Output() loadcontract=new EventEmitter<any>();
 panelTitle: any;
 Id:number;
 index:any=0;
 spinner: boolean = true;
 UserId: any; 
 identity: number = 0;
 columnDefinitions: Column[] = [];
 ContactcolumnDefinitions: Column[] = [];
 contractColumndefinitions:Column[]=[];
 gridOptions: GridOption = {};
 contactdataset: any[] = [];
 contractdataset:any[]=[];
 dataset:any[]=[];
 argsData:any;
 angularGrid: AngularGridInstance;
 gridObj1: any;
 deleteColumn: string;
 ClientLocationForm: FormGroup;
 clientList: ClientList[] = [];
 public currentContract:any=[];
 public contractBaseInfo:any=[];
 listOfclient:ClientList[]=[];
 public contractData:any=[];
 public clientDetails:any=[];
public currentClient:any=[];
ClientLocationModel: ClientLocationModel ={} as any;
 clientData:any;
 Oldobj:any;
 public editData;
 isEdit : boolean  = false;
  constructor( private ClientLocationService:ClientLocationService,
    private clientservice:ClientService,
    private clientcontractservice:ClientContractService,
    private rowdataservice:RowDataService,
    private alertService: AlertService,
    private headerService: HeaderService,
    public modalService: NgbModal,
    public ClientContactService: ClientContactService,
    public router:Router
    ) { 
      this.currentContract=this.setInitialValuesC();
      this.currentClient=this.setInitialValues();
    }
  onIndexChange(index:any){
  if (index.target.textContent=="Client Details"){
         this.index=0;
        this.index=0;
 }
  if (index.target.textContent=="Address") {
  this.index=1;
}  if(index.target.textContent=="Contact Information") {
  this.index=2;
} if(index.target.textContent=="Contract Information"){
  this.index=3;
}
  }

  newButtonLocationClick() {
    const modalRef = this.modalService.open(ClientLocationComponent);
    modalRef.componentInstance.ClientLocationComponent=
   console.log();
    this.panelTitle = "Add New Client Location";
    modalRef.result.then((result) => {
     // result.ClientID=this.currentClient.Id;
      console.log(result);
      console.log(this.clientList);
      result.StatusCode= result.Status == 0 ? "In-Active" : "Active"; 
     //result.ClientName = this.clientList.find(a=>a.Id == result.ClientID).Name,
     result.ClientName=this.currentClient.Name;
      this.angularGrid.gridService.addItem(result);
      this.initial_getClientLocation_load();
    }).catch((error) => {
      console.log(error);
    });
  }
 
setInitialValuesC(){
  return {
    ClientContractBase:{
      Id:0,
      Code:'',
      Name:'',
      ClientId:this.clientInfo.Id
    },
    Id:0,
    Code:'',
    Name:'',
    Description:'',
    ClientId:this.clientInfo.Id,
    LinesOfBusiness:[26],
     ValidFrom:'',
     ValidTo:'',
     ClientType:1,
     ContractType:1,
     IsAutoRenewal:0,
     SignedOn:new Date(),
     SignUpBranch:0,
     ExternalReferenceId:null,
     LastRenewedOn:new Date(),
     Status:1,
  }
}

setInitialValues(){
	return{
    Id:0,
		Code:'',
		Name:'',
		CompanyId:5,
    Status:0,
    OrganizationId:2,
    Notes:null,
    DefaultAccountManagerId:0,
    AdditionalClientDetails:[],
    Shared:0,
    LoginCode:null,
    ExternalRefId:0,
    ShortCode:null,
    industryId:32,  
    clientBase:{
      Id:0,
      Code:'',
      Name:'',
      OrganizationId:2,
      CompanyId:5,
      LoginCode:null,
      ClientLogoUrl:null,
      CreatedBy:null,
      LastUpdatedBy:null
    },
	}
}


  
loadClientLst() {   
  this.ClientLocationService.getclient().subscribe((res)=> {
    let apiResonse: apiResponse = res;
     this.listOfclient = apiResonse.dynamicObject;
     console.log('Client List', this.listOfclient );
    

  }),
  ((err)=> {
  }); 
}

    public createOrUpdateClient(client:any){
      let clientWithId;

      console.log(this.clientData);
      clientWithId = _.find(client,(e1=>e1.id===client.id));
      
      console.log(clientWithId);
      if(clientWithId==0){
      

        let insertData;
         insertData = JSON.stringify(client);
    
        console.log('insertData',insertData);
    
      this.clientservice.postClient(insertData).subscribe((data:any)=>{
        console.log(data);
      });
      
    
    }else{
    
    console.log('update data');
      console.log('oldobj outside ngOnint',this.Oldobj);
      this.Oldobj.Status='Active'? 1:0;
      this.Oldobj.clientBase.Status = 'Active' ? 1:0;
      client.ModeType = UIMode.Edit; 
      let newObj=JSON.stringify({newobj:client,oldobj:this.Oldobj});
      console.log('nwobj',newObj);
         this.clientservice.putClient(newObj).subscribe((data:any)=>{
           console.log(data);
      if(data.Status==false){
       console.log('update failed');
      }
         });
       
       
      }  
    }

    public createNewContract(contract:any){
      console.log(contract);
      let contractWithId=_.find(contract,(e1=>e1.id===contract.id));
      console.log('contractIdData',contractWithId);
      if(contractWithId==0){

  console.log(this.currentContract);
      let insertData=JSON.stringify(contract);
      console.log('Insert Data from stepper',contract);
      this.clientcontractservice.postClientContractdetils(insertData)
      .subscribe(contractRecord=>this.contractData.push(insertData));
      }else{
  console.log('edit initiated');
       this.clientcontractservice.getClientContract(this.contractInfo.ClientId).subscribe((data:any)=>{
         if(data.Status==true){  
         this.contractData=data.dynamicObject;
       }

         console.log(this.contractData);
       });
        console.log('edit data stepper',this.editData);
       let insertData1 = JSON.stringify(contract);
       console.log('update insert',insertData1);
       this.clientcontractservice.putClientContractdetils(insertData1).subscribe((data:any)=>{
             console.log(data);
      })
      }
      this.onChangeClient();

      }
  
      RecordEdit(record:any){ 
  this.currentContract=record;
  console.log('Edit data from stepper',this.currentContract);
    }
  
onChangeClient(){
  
  this.clientcontractservice.getClientContract(this.contractInfo.ClientId).subscribe((data:any)=>{
    if(data.Status==true){  
    this.contractData=data.dynamicObject;
  }
    console.log('grid data',this.contractData);
  });
  }

  initial_getClientLocation_load() {   
      this.spinner = false;
    this.ClientLocationService.getClientLocationByClientId(this.currentClient.Id).subscribe(response => {
      this.spinner=true;
      console.log(response);      
      console.log(this.currentClient.Id);
      this.ClientLocationService.getClientLocationByClientId(this.currentClient.Id).subscribe(response2 => {
        this.dataset = response.dynamicObject;
        console.log(response2);
        this.clientList = response2.dynamicObject;
        console.log('initial dataset',this.dataset);
        console.log(this.currentClient.Name);
        this.dataset.forEach(element => {
          //element['ClientName'] = this.clientList.find(a=>a.Id == element.ClientID).Name,
          console.log('element',element);
          element["ClientName"] = this.currentClient.Name;
          element["StatusCode"] = element.Status == 0 ? "In-Active" : "Active";
        
        });
        console.log(this.dataset.length);
        this.spinner=false;
      }, (error) => {
        this.spinner=false;
      });  
      this.spinner=false;
    }, (error) => {
      this.spinner=false;
    });

   
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
      this.confirmDeleteid(metadata.dataContext.Id, metadata.dataContext.LocationCode);
    }
  
  }
  onCellClickedContract(e,args){
    const metadata= this.angularGrid.gridService.getColumnFromEventArguments(args);
    if(metadata.columnDef.id==='edit'){
      this.editContractClicked(metadata.dataContext.Id);
    }
    else if(metadata.columnDef.id==='delete'){
      //this.deleteContract(metadata.dataContext.Id,metadata.dataContext.ContactCode);
    }
  }

  onCellClickedContact(e,args){
    const metadata= this.angularGrid.gridService.getColumnFromEventArguments(args);
    if(metadata.columnDef.id==='edit'){
      this.editContactClicked(metadata.dataContext.Id);
    }
    else if(metadata.columnDef.id==='delete'){
      this.deleteContact(metadata.dataContext.Id,metadata.dataContext.ContactCode);
    }
  }
  editContractClicked(id:number){
    this.identity=+id;
    console.log(id);
    console.log(this.contractdataset);
    let i:any = this.contractdataset.filter(item=>item.Id==id);
    console.log(i[0]);
    this.Id=i.Id;
    this.rowdataservice.dataInterface.RowData = i[0];
    this.router.navigate(['app/ClientContract']);

  }

  editContactClicked(id:number){
    //this.panelTitle = "Edit Client Location";
    this.identity = + id;
   let i : any = this.dataset.filter(item => item.Id == id);
   //let clientId= i[0].ClientID;
    //i.ClientName=this.clientList.find(a=>a.Id == clientId).Name;
   const modalRef = this.modalService.open(ClientContactComponent);
   modalRef.componentInstance.id = id;
   modalRef.componentInstance.jsonObj = i;
   modalRef.result.then((result) => {
    let isSameResult = false;
    isSameResult = _.find(this.dataset, (a) => a.Id == result.Id) != null ? true : false;
console.log(result);
    if (isSameResult) {
      result.StatusCode= result.Status == 0 ? "In-Active" : "Active"; 
      this.angularGrid.gridService.updateItemById(result.Id, result);

    } else {
      result.StatusCode= result.Status == 0 ? "In-Active" : "Active"; 
      result.ClientName = this.clientList.find(a=>a.Id == result.ClientID).Name,
      this.angularGrid.gridService.addItem(result);
    }

   });
  }

  deleteContact(id:number,DeleteColumnValue:string){
    this.identity=+id;
    this.deleteColumn=DeleteColumnValue;
    $('#modaldeleteconfimation').modal('show');

  }

  editButtonClick(id: number) {
    // if (this._authorizationGuard.CheckAcess("Countries", "ViewEdit")) {
    //   return;
    // }
    console.log(this.panelTitle);
    debugger
    //this.panelTitle = "Edit Client Location";
    this.identity = + id;
   let i : any = this.dataset.filter(item => item.Id == id);
   //let clientId= i[0].ClientID;
    //i.ClientName=this.clientList.find(a=>a.Id == clientId).Name;
   const modalRef = this.modalService.open(ClientLocationComponent);
   modalRef.componentInstance.id = id;
   modalRef.componentInstance.jsonObj = i;
   modalRef.result.then((result) => {
    let isSameResult = false;
    isSameResult = _.find(this.dataset, (a) => a.Id == result.Id) != null ? true : false;

    if (isSameResult) {
      result.StatusCode= result.Status == 0 ? "In-Active" : "Active"; 
      result.ClientName = this.clientList.find(a=>a.Id == result.ClientID).Name,
      this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

    } else {
      result.StatusCode= result.Status == 0 ? "In-Active" : "Active"; 
      result.ClientName = this.clientList.find(a=>a.Id == result.ClientID).Name,
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
  newButtonContactClick() {
          
    //this.router.navigate(['app/ui/ClientView']);
    const modalRef = this.modalService.open(ClientContactComponent);
    modalRef.result.then((result) => {
      console.log(result);
      result.ClientName = this.currentClient.Name,
        result.PrimaryMobile = result.LstClientContact.PrimaryMobile;
      result.PrimaryEmail = result.LstClientContact.PrimaryEmail;
      result.StatusCode = result.Status == 0 ? "In-Active" : "Active";
      this.angularGrid.gridService.addItem(result);
      // this.initial_getClientContact_load();    

    }).catch((error) => {
      console.log(error);
    });


  }
  
  initial_getClientContact_load() {
console.log(this.currentClient);
    this.ClientContactService.getClientContactbyClientId(this.currentClient.Id).subscribe(response => {
      this.spinner = true;
      console.log(response);
      this.ClientContactService.getClientContactbyClientId(this.currentClient.Id).subscribe(response2 => {
        this.contactdataset = response.dynamicObject;
        console.log(this.contactdataset);
        console.log(response2);
        this.clientList = response2.dynamicObject;
        try {
          this.contactdataset.forEach(contactelement => {

            console.log('contact element',contactelement);
            contactelement["ClientName"] = this.currentClient.Name,
             contactelement["PrimaryMobile"] = contactelement.LstClientContact.PrimaryMobile;
            contactelement["PrimaryEmail"] = contactelement.LstClientContact.PrimaryEmail;
            contactelement["StatusCode"] =contactelement.Status == 0 ? "In-Active" : "Active";
          });
        } catch (error) {
        }
      },
        (error) => {
          this.spinner = false;
        });
      console.log(this.contactdataset.length);

      this.spinner = false;
    }, (error) => {
      this.spinner = false;
    });
  }

  initial_getContractDetails_load(){
    console.log('client inside contract',this.currentClient);
    this.clientcontractservice.getClientContract(this.currentClient.Id).subscribe(res=>{
      this.spinner=true;
      console.log(res);
      this.contractdataset=res.dynamicObject;
      try{
        this.contractdataset.forEach(element=>{
          element["StatusCode"]=element.Status == 0 ? "in-Active":"Active";
        });
      }
      catch(error){

      }(error)=>{
        this.spinner=false;

      }
      });
    }
  

  
newButtonContractClick(){
  //this.router.navigate(['app/ClientContract']);
 console.log(this.rowdataservice.dataInterface.RowData);
 const modalRef = this.modalService.open(NewContractComponent);
    this.panelTitle = "Add New Client Contract";
    modalRef.result.then((result) => {
      console.log(result);
      result.StatusCode= result.Status == 0 ? "In-Active" : "Active"; 
      this.angularGrid.gridService.addItem(result);
      this.initial_getContractDetails_load();
    }).catch((error) => {
      console.log(error);
    });
   
}

  ngOnInit() {   

    this.currentClient= JSON.parse(JSON.stringify(this.rowdataservice.dataInterface.RowData));
   this.Oldobj= JSON.parse(JSON.stringify(this.rowdataservice.dataInterface.RowData));
console.log(this.Oldobj);
   if(this.rowdataservice.dataInterface.RowData != undefined && this.rowdataservice.dataInterface.RowData != null ){
     this.isEdit = true;
     this.currentClient.Status='Active'? 1:0;
    this.currentClient.clientBase.Status = 'Active' ? 1:0;
    console.log('oldobj in ngOnint',this.Oldobj);
}
if(this.currentClient!= undefined || this.currentClient!= null){
this.currentContract.ClientId=this.currentClient.Id;
    this.currentContract.ClientContractBase.ClientId=this.currentClient.Id;
console.log('contractData from stepper',this.currentContract);
}
console.log(this.contractData);

//this.headerService.setTitle('Client Location');
this.initial_getContractDetails_load();
   
this.columnDefinitions = [
  // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
  { id: 'client', name: 'Client', field: 'ClientName', formatter: Formatters.uppercase, sortable: true,filterable:true },
  { id: 'code', name: 'Location Code', field: 'LocationCode', formatter: Formatters.uppercase, sortable: true,filterable:true },
  { id: 'Name', name: 'Location Name', field: 'LocationName', sortable: true,filterable:true },
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
this.ContactcolumnDefinitions = [
  // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
  //{ id: 'salutation', name: 'Salutation', field: 'Salutation', formatter: Formatters.uppercase, sortable: true },
  { id: 'client', name: 'Client', field: 'ClientName', formatter: Formatters.uppercase, sortable: true, filterable: true },
  { id: 'name', name: 'Client Contact Name', field: 'Name', sortable: true, filterable: true },
  { id: 'designation', name: 'Designation', field: 'Designation', sortable: true, filterable: true },
  { id: 'mobile', name: 'Mobile', field: 'PrimaryMobile', sortable: true, filterable: true },
  { id: 'email', name: 'Email', field: 'PrimaryEmail', sortable: true, filterable: true },
  // { id: 'isSPOC', name: 'IsSinglePointOfContact', field: 'IsSinglePointOfContact',cssClass: 'right-align', sortable: true },
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
this.contractColumndefinitions=[
    // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
  //{ id: 'salutation', name: 'Salutation', field: 'Salutation', formatter: Formatters.uppercase, sortable: true },
 // { id: 'client', name: 'Client', field: 'ClientName', formatter: Formatters.uppercase, sortable: true, filterable: true },
  { id: 'name', name: 'Contract Name', field: 'Name', sortable: true, filterable: true },
  { id: 'validFrom', name: 'Start Date', field: 'ValidFrom', sortable: true, filterable: true },
  { id: 'validTo', name: 'End Date', field: 'ValidTo', sortable: true, filterable: true },
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
      this.argsData=args;
      console.log(this.argsData);
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
this.initial_getClientContact_load();
this.initial_getContractDetails_load();

}

// var io = 
// {
//   "Id": 0,
//   "OrganizationId": 0,  
//   "Code": "NIC",
//   "Name": "Natual Ice Cream",
//   "Status": 1,
//   "Notes": "",
//   "LstAdditionalClientDetails": [
//     { 
//       "PropertyName": "CareerPortal",
//       "IsReqiured": true,
//       "PropertyValue": "https://nic.com",
//       "Status": 1,
//       "Id": 0,     
//     }
//   ],
//   "Shared": 0, 
//   "LstContact": [
//     {
      
//       "Salutation": 1,
//       "Name": "Nirav",
//       "Designation": "Manager",
//       "IsSinglePointOfContact": true,
//       "LstClientContact": {
//         "CommunicationCategoryTypeId": 2,
//         "PrimaryMobile": "8989565623",
//         "PrimaryMobileCountryCode": "91",
//         "AlternateMobile": null,
//         "AlternateMobileCountryCode": null,
//         "PrimaryEmail": "nic@test.com",
//         "AlternateEmail": null,
//         "EmergencyContactNo": null,
//         "EmergencyContactNoCountryCode": null,
//         "EmergencyContactPersonName": null,
//         "LandlineStd": null,
//         "LandLine": null,
//         "LandLineExtension": null,
//         "PrimaryFax": null,
//         "AlternateFax": null,
//         "IsDefault": true
//       },
//       "LstClientAddress": {
//         "CommunicationCategoryTypeId": 2,
//         "CountryName": "India",
//         "StateName": "Karnataka",
//         "City": "Bangalore",
//         "DistrictName": "",
//         "Address1": "4/22 M.K Nagar,Near Dharan Hospital, Seelanaickenpatti Bypass,Salem 636201",
//         "Address2": "",
//         "Address3": "",
//         "PinCode": "636201",
//         "CountryId": 100,
//         "CityId": 512,
//         "StateId": 38,
//         "DistrictId": 0
//       },     
//       "Status": 1,
//       "Modetype": 1,
//       "Id": 0     
//     }
//   ], 
//   "ClientBase": {
//     "Code": "NIC",
//     "Name": "Natural Ice Cream",
//     "OrganizationId": 0,
//     "CompanyId": 0,
//     "LoginCode": "string",
//     "ClientLogoURL": "string",
//     "IsDefault": true,
//     "Id": 0   
//   },
//   "Modetype": 1
 
// };
}


