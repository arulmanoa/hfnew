import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { apiResponse } from '../../../_services/model/apiResponse';
import { UIMode } from '../../../_services/model/UIMode';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import { Product, ProductCTCPayrollRuleMapping } from 'src/app/_services/model/Product';
import { Rule } from 'src/app/_services/model/Rule';
import { RuleSet } from 'src/app/_services/model/Ruleset';
import { RuleBuilderComponent } from 'src/app/components/rules/ruleeditor/rulebuilder.component';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, SessionStorage } from 'src/app/_services/service';


@Component({
  selector: 'app-product-ctcpayroll-rule-mapping',
  templateUrl: './product-ctcpayroll-rule-mapping.component.html',
  styleUrls: ['./product-ctcpayroll-rule-mapping.component.css']
})
export class ProductCTCPayrollRuleMappingComponent implements OnInit {

  @Input() product: Product = {} as any;
  @Input() ctcrulesset: RuleSet;
  @Input() payrollruleset: RuleSet;
  @Input() selectedRule: any;

  loginSessionDetails: LoginResponses;
  businessType: any;
  roleId: any;
  userId: any;

  submitted = false;
  disableBtn = false;
  header: string = '';
  spinner: boolean = false;
  ruleMappingForm: FormGroup;

  ctccurrentRule: Rule;
  payrolcurrentRule: Rule;
  ctcRuleList = [];
  payrollRuleList = [];
  CTCdataset = [];
  PayRolldataset = [];

  LstProductCTCPayrollRuleMapping: any[] = [];
  modalOption: NgbModalOptions = {};

  constructor(
    public modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private sessionService: SessionStorage,
  ) {
    this.createForm();
  }

  get g() { return this.ruleMappingForm.controls; }

  createForm() {
    this.ruleMappingForm = this.formBuilder.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      ctcRule:[0, Validators.required],
      payrollRule:[0, Validators.required],
      status: true
    })
  }

  ngOnInit() {
    this.spinner = true;
    this.header = "Rule Map";

    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.businessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.userId = this.loginSessionDetails.UserSession.UserId;
    this.roleId = this.loginSessionDetails.UIRoles[0].Role.Id;

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.modalOption.size = 'lg';
    this.DataBinding_for_Edit();
    console.log('INIT', this.product);
    if (this.ctcrulesset && this.ctcrulesset.hasOwnProperty('RuleList')) {
      this.ctcRuleList = this.ctcrulesset.RuleList;
      
    }
    if (this.payrollruleset && this.payrollruleset.hasOwnProperty('RuleList')) {
      this.payrollRuleList = this.payrollruleset.RuleList;
    }
    if (this.product && Object.keys(this.product).length > 0 && this.product.LstProductCTCPayrollRuleMapping) {
      this.LstProductCTCPayrollRuleMapping = this.product.LstProductCTCPayrollRuleMapping;
      this.LstProductCTCPayrollRuleMapping.forEach(e => {
        e.isRuleSelected = false;
      });
      
      this.spinner = false;
    } else {
      this.spinner = false;
      if (this.product == null || this.product == undefined) {
        this.product = new Product();
      }
      this.product.LstProductCTCPayrollRuleMapping = [];
      this.LstProductCTCPayrollRuleMapping = [];
    }
  }

  DataBinding_for_Edit(): void {
   if (this.selectedRule && Object.keys(this.selectedRule).length > 0) {

      const statusValue = this.selectedRule.Status == 1 || this.selectedRule.Status == 'Active' ? true : false;
    
      this.ruleMappingForm.patchValue({
        code: this.selectedRule.Code,
        name: this.selectedRule.Name,
        description: this.selectedRule.Description,
        ctcRule: this.selectedRule.CTCRuleId,
        payrollRule: this.selectedRule.PayrollRuleId,
        status: statusValue,
      });
    
      if (this.selectedRule.CTCRuleId > 0 || (this.selectedRule.CTCRuleId === 0 && this.selectedRule.CTCRule && Object.keys(this.selectedRule.CTCRule).length)) {
        this.ctcRuleList = this.ctcrulesset.RuleList;
        // if (this.selectedRule.CTCRuleId === 0 && this.selectedRule.CTCRule) {
        //   this.ctcRuleList.push(this.selectedRule.CTCRule[0]);
        // }
        const ctcRule = this.ctcRuleList.find(x => x.Id === this.selectedRule.CTCRuleId);
        this.CTCdataset.push(ctcRule);
      }
    
      if (this.selectedRule.PayrollRuleId > 0 || (this.selectedRule.PayrollRuleId === 0 && this.selectedRule.PayrollRule && Object.keys(this.selectedRule.PayrollRule).length)) {
        this.payrollRuleList = this.payrollruleset.RuleList;
        // if (this.selectedRule.PayrollRuleId === 0 && this.selectedRule.PayrollRule) {
        //   this.payrollRuleList.push(this.selectedRule.PayrollRule[0]);
        // }
        const prRule = this.payrollRuleList.find(x => x.Id === this.selectedRule.PayrollRuleId);
        this.PayRolldataset.push(prRule);
      }
    }
  }

  newCTCRule() {
    if (this.ruleMappingForm.invalid) {
      return this.alertService.showInfo("Please fill the mandatory fields !");
    }
    this.ctccurrentRule = new Rule();
    this.ctccurrentRule.RuleSetId = this.ctcrulesset.Id;
    this.showModal(this.ctccurrentRule, this.ctcrulesset, 1);
  }

  editCTCRule() {
    this.ctccurrentRule = this.ctcRuleList.find(y => y.Id == this.ruleMappingForm.get('ctcRule').value);
    console.log('currentrule', this.ctccurrentRule);

    this.showModal(this.ctccurrentRule, this.ctcrulesset, 1);
  }

  newpayrollRule() {
    if (this.ruleMappingForm.invalid) {
      return this.alertService.showInfo("Please fill the Mandatory fields");
    }
    this.payrolcurrentRule = new Rule();
    this.payrolcurrentRule.RuleSetId = this.payrollruleset.Id;
    this.showModal(this.payrolcurrentRule, this.payrollruleset, 2);
  }

  editPayRollRule() {
    this.payrolcurrentRule = this.payrollRuleList.find(y => y.Id == this.ruleMappingForm.get('payrollRule').value);
    console.log('payrolcurrentrule', this.payrolcurrentRule);

    this.showModal(this.payrolcurrentRule, this.payrollruleset, 2);
  }

  showModal(rule: Rule, ruleset: RuleSet, index) {
    const activeModal = this.modalService.open(RuleBuilderComponent, this.modalOption);
    activeModal.componentInstance.currentRule = rule;
    activeModal.componentInstance.rulesetId = ruleset.Id;
    activeModal.componentInstance.parentComponent = this;
    activeModal.componentInstance.ruleSet = ruleset;
    activeModal.componentInstance.BusinessSystemId = ruleset.BusinessSystemId;
    activeModal.componentInstance.IsFromOtherEntity = true;

    activeModal.result.then((modalResult) => {
      console.log('modalResult', modalResult);
      if (modalResult) {
        modalResult.id = this.isGuid(modalResult.Id) == true ? 0 : modalResult.Id;
        const isAlready = (index === 1) ? this.CTCdataset.some(ctcrule => ctcrule.Id === modalResult.Id) : (index === 2)
            ? this.PayRolldataset.some(payrollrule => payrollrule.Id === modalResult.Id) : false;

             this.ctcRuleList = [...this.ctcRuleList];
        if ((typeof modalResult.Id === 'number' && modalResult.Id > 0) || isAlready) {
          if (index === 1) {
            const indexToUpdate = this.CTCdataset.findIndex(item => item.Id === modalResult.Id);

            if (indexToUpdate !== -1) {
              this.CTCdataset[indexToUpdate] = { ...this.CTCdataset[indexToUpdate], ...modalResult };
              this.ruleMappingForm.get('ctcRule').patchValue(modalResult.Id);
            }
            // this.CTCdataset.push(modalResult);
          } else if (index === 2) {
            const indexToUpdate = this.PayRolldataset.findIndex(item => item.Id === modalResult.Id);

            if (indexToUpdate !== -1) {
              this.PayRolldataset[indexToUpdate] = { ...this.PayRolldataset[indexToUpdate], ...modalResult };
              this.ruleMappingForm.get('payrollRule').patchValue(modalResult.Id);
            }
            // this.PayRolldataset.push(modalResult);
          }
        } else {
          modalResult.Id = this.isGuid(modalResult.Id) == true ? 0 : modalResult.Id;
          if (index === 1) {
            this.CTCdataset = [];
            this.ctcRuleList = [...this.ctcRuleList, modalResult];
            this.ruleMappingForm.controls['ctcRule'].setValue(modalResult.Id);
            this.CTCdataset.push(modalResult);
            this.isCTCRuleEditable();
          } else if (index === 2) {
            this.PayRolldataset = [];
            this.payrollRuleList = [...this.payrollRuleList, modalResult];
            this.ruleMappingForm.controls['payrollRule'].setValue(modalResult.Id);
            this.PayRolldataset.push(modalResult);
            this.isPayrollRuleEditable();
          }
        }
      } else {

      }
    })
    .catch((error) => {
      console.log(error);
    });
  }

  onChangeCtcRule(e) {
    console.log(e);
    if (e) {
      this.CTCdataset = [e];
    } else {
      this.CTCdataset = [];
      this.ruleMappingForm.controls['ctcRule'].setValue(0);
    }
  }

  onChangePayrollRule(e) {
    console.log(e);
    if (e) {
      this.PayRolldataset = [e];
    } else {
      this.PayRolldataset = [];
      this.ruleMappingForm.controls['payrollRule'].setValue(0);
    }
  }

  savePayrollCtcRule() {
    let formData = {} as any;
    if (this.product && this.product.CalculationType === 1 && (this.CTCdataset.length == 0)) {
      return this.alertService.showInfo('Please add atleast one ctc rule');
    }
    if (this.product && this.product.CalculationType === 3 && (this.PayRolldataset.length == 0)) {
      return this.alertService.showInfo('Please add atleast one payroll rule');
    }
    if (this.product && this.product.LstProductCTCPayrollRuleMapping && this.product.LstProductCTCPayrollRuleMapping.length) {
      const isSelected = this.LstProductCTCPayrollRuleMapping.some(rule => rule.isRuleSelected);
      if (isSelected) {
        const selectedRules = this.LstProductCTCPayrollRuleMapping.filter(rule => rule.isRuleSelected);
        const mappedRules = selectedRules.map(rule => ({
          Id: rule.Id,
          Code: this.ruleMappingForm.get('code').value,
          Name: this.ruleMappingForm.get('name').value,
          Description: this.ruleMappingForm.get('description').value,
          CTCRuleId: rule.CTCRuleId,
          PayrollRuleId: rule.PayrollRuleId,
          ProductId: rule.ProductId,
          Modetype: UIMode.None,
          Status: this.ruleMappingForm.get('status').value === true ? 1 : 0,
          CTCRule: rule.CTCRule,
          PayrollRule: rule.PayrollRule,
          CreatedOn: new Date().toISOString(),
          LastUpdatedOn: new Date().toISOString(),
          CreatedBy: this.userId,
          LastUpdatedBy: this.userId,
        })) as any;
    
        this.product.LstProductCTCPayrollRuleMapping.push(...mappedRules);
        formData = mappedRules[0];
      } else if (this.selectedRule && Object.keys(this.selectedRule).length > 0) {
        const selectedRules = this.LstProductCTCPayrollRuleMapping.filter(rule => rule.Id === this.selectedRule.Id);
        const mappedRules = selectedRules.map(rule => ({
          Id: rule.Id,
          Code: this.ruleMappingForm.get('code').value,
          Name: this.ruleMappingForm.get('name').value,
          Description: this.ruleMappingForm.get('description').value,
          CTCRuleId: this.ruleMappingForm.get('ctcRule').value,
          PayrollRuleId: this.ruleMappingForm.get('payrollRule').value,
          ProductId: rule.ProductId,
          Modetype: UIMode.None,
          Status: this.ruleMappingForm.get('status').value === true ? 1 : 0,
          CTCRule: this.CTCdataset && this.CTCdataset.length ? this.CTCdataset[0] : rule.CTCRule,
          PayrollRule: this.PayRolldataset && this.PayRolldataset.length ? this.PayRolldataset[0] : rule.PayrollRule,
          CreatedOn: new Date().toISOString(),
          LastUpdatedOn: new Date().toISOString(),
          CreatedBy: this.userId,
          LastUpdatedBy: this.userId,
        })) as any;
        console.log('RRRRR', mappedRules);
        // this.product.LstProductCTCPayrollRuleMapping.push(...mappedRules);
        formData = mappedRules[0];
      } else {
        formData = this.createFormData();
      }
    } else {
      formData = this.createFormData();
      this.LstProductCTCPayrollRuleMapping = [formData];
      this.product.LstProductCTCPayrollRuleMapping.push(formData);
    }
    
    this.closeModal(formData);
    console.log('temp', this.product);
  }

  createFormData() {
    return {
      Id: UUID.UUID(),
      Code: this.ruleMappingForm.get('code').value,
      Name: this.ruleMappingForm.get('name').value,
      Description: this.ruleMappingForm.get('description').value,
      CTCRuleId: this.ruleMappingForm.get('ctcRule').value,
      PayrollRuleId: this.ruleMappingForm.get('payrollRule').value,
      ProductId: 0,
      Modetype: UIMode.None,
      Status: this.ruleMappingForm.get('status').value === true ? 1 : 0,
      CTCRule: this.CTCdataset && this.CTCdataset.length ? this.CTCdataset[0] : null,
      PayrollRule: this.PayRolldataset && this.PayRolldataset.length ? this.PayRolldataset[0] : null,
      CreatedOn: new Date().toISOString(),
      LastUpdatedOn: new Date().toISOString(),
      CreatedBy: this.userId,
      LastUpdatedBy: this.userId,
    };
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }

  updateRuleSelection(evt: any, data: any, index: string) {
    if (index === 'ALL') {
      this.LstProductCTCPayrollRuleMapping.forEach(e => {
        e.isRuleSelected = evt.target.checked == true ?  true : false
      });
    }
  }

  closeModal(data: any) {
    this.activeModal.close(data);
  }

  cancelModal() {
    this.activeModal.close();
  }

  isCTCRuleEditable(): boolean {
    if (this.selectedRule.CTCRule && Object.keys(this.selectedRule.CTCRule).length) {
      return true;
    } else if (this.CTCdataset && this.CTCdataset.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  isPayrollRuleEditable(): boolean {
    if (this.selectedRule.PayrollRule && Object.keys(this.selectedRule.PayrollRule).length) {
      return true;
    } else if (this.PayRolldataset && this.PayRolldataset.length > 0) {
      return true;
    } else {
      return false;
    }
  }

}
