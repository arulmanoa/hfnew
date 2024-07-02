import { Component, OnInit,Input,Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
@Component({
  selector: 'app-add-update-client',
  templateUrl: './add-update-client.component.html',
  styleUrls: ['./add-update-client.component.css']
})
export class AddUpdateClientComponent implements OnInit {
@Input() clientInfo:any=[];
@Input() clientBaseInfo:any=[];

@Output() clientCreated = new EventEmitter<any>();
clientForm:FormGroup;

  constructor() {}
  get f() {return this.clientForm.controls;}
  ngOnInit() {
if(this.clientInfo==null){
  this.newclientInfo();
}
  }

  newclientInfo() {
    this.clientInfo={
      //Id:this.clientBaseInfo.Id,
      Id:0,
      Code:'',
      Name:'',
      CompanyId:5,
      Status:1,
    OrganizationId:2,
    Notes:null,
    DefaultAccountManagerId:0,
     AdditionalClientDetails:[],
    Shared:0,
    LoginCode:null,
    ExternalRefId:0,
    ShortCode:null,
     industryId:32,
     clientBase: this.clientBaseInfo={
        Id:0,
        Code:'',
        Name:'',
        OrganizationId:2,
        CompanyId:5,
        LoginCode:null,
        ClientLogoUrl:null,
        Status:1
      },
      };

  }

  /*newClientBase(){
      this.clientBaseInfo={
        Id:1,
        Code:'',
        Name:'',
        OrganizationId:2,
        CompanyId:'',
        LoginCode:null,
        ClientLogoUrl:null,
        IsDefault:true
      }*/
    //};
  createOrUpdateClient(event:any){
    this.clientCreated.emit(this.clientInfo);
    //this.clientBaseCreated.emit(this.clientBaseInfo);
    //this.newClientBase();
    this.newclientInfo();
  }

  onClientNameChange(){
    this.clientInfo.clientBase.Name = this.clientInfo.Name;
    console.log("Client name changed ::" , this.clientInfo)
  }
  
  OnCodeChange(){
    this.clientInfo.clientBase.Code=this.clientInfo.Code;
console.log("Code Code Changed",this.clientInfo);
  }

  
}

