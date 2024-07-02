import { Component, OnInit,Input } from '@angular/core';
import { NgbModal, NgbModalOptions ,NgbActiveModal,ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/_services/service';
import { ClientService } from 'src/app/_services/service';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import {ClientContractService} from 'src/app/_services/service/clientContract.service';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import {ClientLocationService} from 'src/app/_services/service/clientlocation.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { ClientContract } from 'src/app/_services/model/Client/ClientContract';
import { ClientContractBase } from 'src/app/_services/model/Client/ClientContract';

@Component({
  selector: 'app-contract-new',
  templateUrl: './contract-new.component.html',
  styleUrls: ['./contract-new.component.css']
})
export class NewContractComponent implements OnInit {
public contractData:any=[];
public currentContract:any;
public clientInfo:any;
listOfclient:any;
clientContractForm:FormGroup;
@Input() id:number;
@Input() jsonObj:any;
submitted=false;
clientContractdetails : ClientContract={} as any;
contractbase:any={};
ContractminDate: Date;

//@Input() ClientId : number;
Oldobj:any;
  constructor(private modalservice:NgbModal,
              private activemodal:NgbActiveModal,
              private alertService:AlertService,
              private rowdataservice:RowDataService,
              private clientcontractservice:ClientContractService,
              private router:Router,
              private clientservice:ClientService,
              private ClientLocationService:ClientLocationService,
              private formBuilder: FormBuilder,
              private activeModal: NgbActiveModal,

               ) {
                //this.currentContract=this.setInitialValues();

               }


/*
setInitialValues(){
  return {
    ClientContractBase:{
      Id:0,
      Code:'',
      Name:'',
      ClientId:0
    },
    Id:0,
    Code:'',
    Name:'',
    Description:'',
    ClientId:0,
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




/*
  closeResult='';
  NewContractClicked(record:any)
  {
    this.modalservice.open(record,{ariaLabelledBy:'modal-basic-title'}).result.then((result)=>{
      {
        this.closeResult=`Closed with:${result}`;
      }(reason)=>{
        this.closeResult=`Dismissed ${this.getDismissReason(reason)}`;
      }
    }); 
  }

  private getDismissReason(reason:any):string{
    if(reason===ModalDismissReasons.ESC){
      return 'by pressing ESC'
    }else if(reason===ModalDismissReasons.BACKDROP_CLICK){
      return 'By Clicking BackDrop'
    }else{
      return `with:${reason}`;
    }
  }
*/
  /*ublic createNewContract(contract:any){
    let contractWithId=_.find(contract,(e1=>e1.id===contract.id));
    console.log('contractIdData',contractWithId);
    if(contractWithId==0){
//this.currentContract.ClientId=this.clientnewcomp.currentClient.Id;
//this.currentContract.ClientContractBase.ClientId=this.clientnewcomp.currentClient.Id;
console.log(this.currentContract);
    let insertData=JSON.stringify(contract);
    console.log('Insert Data',insertData);
    this.clientcontractservice.postClientContractdetils(insertData)
    .subscribe(contractRecord=>this.contractData.push(insertData));
    }else{

//console.log('oldObj outside ngOnint',this.Oldobj);
//contract.ModeType=UIMode.Edit;
     //let insertData1=JSON.stringify({newobj:contract,oldobj:this.Oldobj});

      this.Oldobj =JSON.parse( JSON.stringify(this.currentContract));

     let insertData1 = JSON.stringify({newobj:contract,oldobj:this.Oldobj});
     console.log('update insert',insertData1);
     this.clientcontractservice.putClientContractdetils(insertData1).subscribe((data:any)=>{
       console.log(data);
     })
    }
    this.currentContract=this.setInitialValues();
    }

    RecordEdit(record:any){
    console.log('ewrfw',record);
this.currentContract=record;
console.log('Edit',this.currentContract);
  }

clientId(Id:any){
  console.log('clientId',Id);
   this.clientcontractservice.getClientContract(Id).subscribe((data:any)=>this.contractData=data);
   console.log('grid data',this.contractData);
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

  */
get f() { return this.clientContractForm.controls; }

createNewContract(){
  console.log(this.clientContractdetails);
this.submitted=true;
var clientContractdetails = new ClientContract();
this.clientContractdetails.ClientId=this.clientContractForm.get("ClientId").value;
this.clientContractdetails.Name=this.clientContractForm.get("name").value;
this.clientContractdetails.Code=this.clientContractForm.get("code").value;
this.clientContractdetails.ClientType=1;
this.clientContractdetails.Description=this.clientContractForm.get("description").value;
this.clientContractdetails.Id=0
this.clientContractdetails.IsAutoRenewal=true;
this.clientContractdetails.LastRenewedOn=new Date();
this.clientContractdetails.Status=1;
this.clientContractdetails.ValidFrom=this.clientContractForm.get("validFrom").value;
this.clientContractdetails.ValidTo=this.clientContractForm.get("validTill").value;
this.clientContractdetails.SignedOn=new Date();


if(this.clientContractdetails.Id==0){
this.contractbase={
  "Code":this.clientContractdetails.Code,
  "Name":this.clientContractdetails.Name,
  "ClientId":this.clientContractdetails.ClientId
}
this.clientContractdetails.ClientContractBase=this.contractbase;
  console.log(this.clientContractdetails);
this.clientContractdetails.Modetype=UIMode.None
}
var ClientContract_request_param = JSON.stringify(this.clientContractdetails);
console.log(ClientContract_request_param);
this.clientcontractservice.postClientContractdetils(ClientContract_request_param).subscribe((data:any)=>{
  console.log(data);
})

}
onChangeStartDate(event) {

  if (this.clientContractForm.get('ValidFrom').value != null || this.clientContractForm.get('ValidFrom').value != undefined) {
    var StartDate = new Date(event);
    this.ContractminDate = new Date();
    this.ContractminDate.setMonth(StartDate.getMonth());
    this.ContractminDate.setDate(StartDate.getDate() + 1);
    this.ContractminDate.setFullYear(StartDate.getFullYear());
  }
}

loadClientLst() {
    
  this.ClientLocationService.getclient().subscribe((res)=> {

    let apiResonse: apiResponse = res;
 
     this.listOfclient = apiResonse.dynamicObject;
     console.log('dfd', this.listOfclient );
    
  }),
   
 
  ((err)=> {

  });

  
}
closeModal() {

  this.activeModal.close('Modal Closed');

}

  ngOnInit() {
    this.loadClientLst();
    //this.createNewContract();
this.clientContractForm=this.formBuilder.group({
  Id:[0],
  name:['',Validators.required],
  code:['',Validators.required],
  validFrom:['',Validators.required],
  validTill:['',Validators.required],
  ClientId:['',Validators.required],
  Status:[true],
IsAutoRenewal:[true],
description:['',Validators.required]
})





















   // this.loadClientLst();

    //this.currentContract=this.rowdataservice.dataInterface.RowData;
    //this.Oldobj=JSON.parse(JSON.stringify(this.currentContract));
    //console.log('oldobj in ngOnint',this.Oldobj);
    //this.currentContract.Status='Active'? 1:0;
    //this.currentContract.ClientContractBase.Status = 'Active' ? 1:0;
    
    //let insert= JSON.stringify(this.currentContract);
   // console.log('updateContract',insert);
   //console.log('clientId',this.contractData.ClientId);
  // this.clientcontractservice.getClientContract(this.contractData.ClientId).subscribe((data:any)=>this.contractData=data)
   
  }

}


