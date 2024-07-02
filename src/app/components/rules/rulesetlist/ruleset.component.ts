import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { RuleSet } from '../../../_services/model/Ruleset';
import { RulesService } from '../../../_services/service/rules.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RulesetListComponent } from './rulesetlist.component';
import { ClientService } from '../../../_services/service/client.service';
import { BSMService } from 'src/app/_services/service/bsm.service';
import { CommonService } from 'src/app/_services/service/common.service';

@Component({
  selector: 'ngx-modal',
  templateUrl: './ruleset.component.html',
  styleUrls: ['../rules.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RulesetComponent implements OnInit {

  modalHeader: string;
  ruleset: RuleSet;

  msg: any;
  parentComponent: RulesetListComponent;

  implCompCodeList: any[];
  clientCodeList: any[];
  contractCodeList: any[];
  lookupGroupList: any[];

  businessSystemList: any[];

  constructor(private commonApi:CommonService, private activeModal: NgbActiveModal, private systemApi: BSMService, private rulesApi: RulesService, private clientApi: ClientService, private modalService: NgbModal) {
    if (this.ruleset == undefined) {
      this.ruleset = new RuleSet();
    }
    if (this.clientCodeList == undefined) {
      this.clientCodeList = [];
    }
    if (this.contractCodeList == undefined) {
      this.contractCodeList = [];
    }  

    this.systemApi.GetBusinessSystemCodesByImplementation().subscribe((data) => {
      this.businessSystemList = data;
    },
      //error => this.msg = <any>error
    );   
    
    this.commonApi.getAllLookupGroups().subscribe((data) => {
      this.lookupGroupList = data;
    },
      //error => this.msg = <any>error
    );   

  }

  ngOnInit() {
    if (this.ruleset.Id == undefined || this.ruleset.Id == 0) {

      this.modalHeader = " Add RuleSet";
    }
    else {
      this.modalHeader = " RuleSet - " + this.ruleset.Code;
      if(this.ruleset.ImplementationCompanyId > 0)
      {
        this.clientApi.GetClientBaseCodesByImplementationCompany(this.ruleset.ImplementationCompanyId).subscribe((data) => {
          this.clientCodeList = data;
        },
          //error => this.msg = <any>error
        );
  
        if(this.ruleset.ClientId > 0)
        {
          this.clientApi.GetClientContractBaseCodesByClientId(this.ruleset.ClientId).subscribe((data) => {
            this.contractCodeList = data;
          },
            //error => this.msg = <any>error
          );
        }
      }
    }

  
  }

 
  onGroupChange(grpId)
  {
    this.ruleset.GroupId = grpId;
  }

  onBSChange(bsId)
  {
    this.ruleset.BusinessSystemId = bsId;
  }

  onCompanyChange(implCompId) {
    this.ruleset.ImplementationCompanyId = implCompId;
    this.clientApi.GetClientBaseCodesByImplementationCompany(implCompId).subscribe((data) => {
      this.clientCodeList = data;
    },
      //error => this.msg = <any>error
    );
  }

  onClientChange(clientId) {
    this.ruleset.ClientId = clientId;
    this.clientApi.GetClientContractBaseCodesByClientId(clientId).subscribe((data) => {
      this.contractCodeList = data;
    },
      //error => this.msg = <any>error
    );
  }

  onContractChange(contractId) {
    this.ruleset.ClientContractId = contractId;
  }

  saveAndClose() {
    if (window.confirm('Are you sure you want to save this RuleSet?')) {
      if (this.ruleset.Id == undefined || this.ruleset.Id == 0) {
        this.ruleset.CreatedBy = "sandeep";//get from session
      }
      this.ruleset.LastUpdatedBy = "sandeep";
      this.ruleset.Status = 1;
      this.rulesApi.UpsertRuleSet(this.ruleset).subscribe(res => {
        if (res.Error == null) {
          if (res.InsertedId > 0) {
            this.ruleset.Id = res.InsertedId;
          }

          this.activeModal.close({ Object: this.ruleset, Result: true, Component: this.parentComponent });
        }
        else {
          alert(res.Error.ErrorMessage);
          return;
        }
        //alert("Business System saved successfully");
        // if(this.parentRefreshFunc!=null)
        // {
        //   this.parentRefreshFunc.loadBusinessSystems();
        // }
        // event.newData['name'] += ' + added in code';
        // event.confirm.resolve(event.newData);
        // this.loadBusinessSystems();
        // const activeModal = this.modalService.open(MethodDetailsComponent, { size: 'sm', container: 'nb-layout' });
        // activeModal.componentInstance.modalHeader = "Information";
        // activeModal.componentInstance.modalContent = "Assemblies updated successfully";

        // this.loadAssemblies();

      }, err => {
        alert(err);
        // const activeModal = this.modalService.open(MethodDetailsComponent, { size: 'sm', container: 'nb-layout' });
        // activeModal.componentInstance.modalHeader = "Error";
        // activeModal.componentInstance.modalContent = err.error.text;

      });


    }
    // else 
    // {
    //   event.confirm.reject();
    // }
    // // if (this.system.FunctionGroupList == undefined) {
    //   this.system.FunctionGroupList = [];
    // }

    // if (this.system.FunctionGroupList.some(x => x.IsEdited == true)) {
    //   this.system.FunctionGroupList.find(x => x.IsEdited == true).Name = this.functionGroup.Name;
    //   this.system.FunctionGroupList.find(x => x.IsEdited == true).Description = this.functionGroup.Description;
    // }
    // else {
    //   this.system.FunctionGroupList.push(this.functionGroup);
    // }

    // this.rest.AddFunctionGroup(this.system.Id, this.functionGroup).subscribe(res => {
    //   this.closeModal();

    //   const activeModal = this.modalService.open(ModalWindowComponent, { size: 'sm', container: 'nb-layout' });
    //   activeModal.componentInstance.modalHeader = "Information";
    //   activeModal.componentInstance.modalContent = "Function Group saved successfully";



    // }, err => {
    //   const activeModal = this.modalService.open(ModalWindowComponent, { size: 'sm', container: 'nb-layout' });
    //   activeModal.componentInstance.modalHeader = "Error";
    //   activeModal.componentInstance.modalContent = err.error.text;

    // });


    // // if(this.okFunc!=null)
    // // {
    // //   this.okFunc("");
    // // }

  }

  closeModal() {
    // if (this.system.FunctionGroupList.some(x => x.IsEdited == true)) {
    //   this.system.FunctionGroupList.find(x => x.IsEdited == true).IsEdited = false;
    // }
    this.activeModal.close(false);
  }
}