import { Component, OnInit } from '@angular/core';
import _, { max, min, result } from 'lodash';
import { AlertService, EmployeeService, PagelayoutService } from 'src/app/_services/service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { UIMode } from 'src/app/_services/model/UIMode';
import { ELCStatus } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { SharedDataService } from 'src/app/_services/service/share.service';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { TaxcalculatorComponent } from '../../investment/taxcalculator/taxcalculator.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-flexible-benefits-plan-declaration',
  templateUrl: './flexible-benefits-plan-declaration.component.html',
  styleUrls: ['./flexible-benefits-plan-declaration.component.css']
})
export class FlexibleBenefitsPlanDeclarationComponent implements OnInit {

  constructor(
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
    private alertservice: AlertService,
    private employeeService: EmployeeService,
    public sessionService: SessionStorage,
    private pageLayoutService: PagelayoutService,
    private utilityservice: UtilityService,
    private loadingScreenService: LoadingScreenService,
    private sharedDataService: SharedDataService,
    private modalService: NgbModal,
  ) { }

  spinner: boolean = false;
  SpinnerShouldhide: boolean = false;
  SpinnerShouldhideForSave: boolean = false;
  visible: boolean = false;
  employeeId: any = 0;
  _loginSessionDetails: LoginResponses;
  disableSaveBtn: boolean = true;
  salaryBreakupDetails: any;
  fbpComponents: any[] = [];
  salaryComponents: any;
  showSubmitBtn: boolean = false;
  latestRateset: any;
  fbpConfigELCId: number | string = 0;
  FBPSlotId: any;
  FBPConfig: any;
  productForFBPCalculation: any;
  calculateData: any = {};
  totalAllocatedAmount: number | string;
  totalUnallocatedAmount: number | string;
  totalFBPAmount: number | string = 0;
  mode: string;
  isManagerLogin: boolean = false;
  isViewMode: boolean = false;
  isConfigFailed: boolean = false;
  showNoDataAvailable: boolean = false;
  showNoDataAvailableMsg: string = 'There seems to be no data available to show';
  employeeName: any = '';
  employeeCode: any = '';

  modalOption: NgbModalOptions = {};

  currentEmployeeRateSet: EmployeeRateset = new EmployeeRateset();
  ngOnInit() {

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    this.spinner = true;
    this.disableSaveBtn = false;
    this.titleService.setTitle('FBP Declaration');
    this.loadingScreenService.startLoading();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.employeeId = this._loginSessionDetails.EmployeeId;
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodeMode = atob(params["Mdx"]); // Mode
        this.mode = encodeMode;
        this.isViewMode = this.mode.toUpperCase() == 'VIEW' ? true : false;
        //this.isManagerLogin = this.mode != 'approval' || this.employeeId != 0 ? false : true;
        const roleCode = atob(params["Rdx"]); // Role
        this.isManagerLogin = roleCode.includes('manager') ? true : false;
        var encodedEdx = atob(params["Edx"]); // fbp slot Id
        this.FBPSlotId = encodedEdx;
        this.fbpConfigELCId = atob(params["elcIdx"]);
        this.employeeId = this.isManagerLogin || this.employeeId == 0 ? atob(params["Idx"]) : this.employeeId;
        console.log(':::: ENCODED ELCID/MODE ::::', this.fbpConfigELCId, encodeMode);
        this.getsalaryBreakupDetails().then((res) => {
          this.spinner = true;
          this.employeeService.getFBPComponentsForAnEmployee(this.employeeId).subscribe((result) => {
            if (result.Status && result.Result != '') {
              const parsedResult = JSON.parse(result.Result);
              console.log('FBP CMP===', parsedResult);
              const output = parsedResult.map(({ Code, Description, Name, RoundOffValue, F }) =>
                F.map(({ DefaultValue, IsOverridable, MaximumValue, MinimumValue, ProductId, ProductTypeCode, ProductTypeId }) => (
                  {
                    Code, Description, Name, RoundOffValue, DefaultValue, IsOverridable, MaximumValue, MinimumValue, ProductId, ProductTypeCode, ProductTypeId
                  }))
              ).flat();
              console.log('FBP COMP RESULT---', output);
              this.salaryComponents = [];
              let salaryComponents = [];
              let addTheFBPComponentsAsItIs = output;
              this.salaryBreakupDetails[0].EmployeeRatesets[0].RatesetProducts.forEach(a => {
                //  a.Modetype = UIMode.Edit;
                const matchProductId = output.filter(o => o.ProductId == a.ProductId)[0];
                // console.log('*MATCH*', matchProductId);
                if (this.mode.toLowerCase() != 'new' && a.ProductId === this.FBPConfig[0].ProductIdForFBPCalculation) {
                  a.Modetype = UIMode.Edit;
                  a.Value = Number(this.totalUnallocatedAmount) >= 0 && a.Value != this.totalUnallocatedAmount ? this.totalUnallocatedAmount : a.Value;
                  salaryComponents.push(a);
                }
                if (this.mode.toLowerCase() === 'new' && a.ProductId === this.FBPConfig[0].ProductIdForFBPCalculation) {
                  a.Modetype = UIMode.Edit;
                  a.Value = a.Value;
                  salaryComponents.push(a);
                }
                if (a.Value != 0 && !output.some(e => a.ProductId == e.ProductId) && a.ProductId != this.FBPConfig[0].ProductIdForFBPCalculation) {
                  a.isFBPComponent = false;
                  // this.fbpComponents.push(a);
                  salaryComponents.push(a);
                }
                if (output.some(e => a.ProductId == e.ProductId)) {
                  a.isFBPComponent = true; // matchProductId.IsOverridable ? true : false;
                  a.Modetype = UIMode.Edit;
                  a.Value = a.Value;
                  if (this.mode.toLowerCase() === 'new') {
                    a.Value = a.Value > 0 ? a.Value : matchProductId.MinimumValue;
                  }
                  if (!matchProductId.IsOverridable) {
                    a.Value = matchProductId.DefaultValue;
                  }
                  a.MaximumValue = matchProductId.MaximumValue;
                  a.MinimumValue = matchProductId.MinimumValue;
                  a.DefaultValue = matchProductId.DefaultValue;
                  a.IsOveridable = matchProductId.IsOverridable
                  this.fbpComponents.push(a);
                  if (this.fbpComponents && this.fbpComponents.length) {
                    addTheFBPComponentsAsItIs.forEach(f => {
                      const isExistsInArr: any = this.fbpComponents.filter(o1 => o1.ProductId == f.ProductId);
                      if (isExistsInArr && isExistsInArr.length) {
                        addTheFBPComponentsAsItIs = this.removeObjectWithId(addTheFBPComponentsAsItIs, isExistsInArr[0].ProductId);
                        addTheFBPComponentsAsItIs.push(isExistsInArr[0]);
                      }
                    });
                  }
                  // salaryComponents.push(a);
                  // this.totalFBPAmount = this.totalFBPAmount + a.Value;
                } else {
                  addTheFBPComponentsAsItIs.forEach(f => {
                    const isExistsInArr: any = this.fbpComponents.filter(o1 => o1.ProductId == f.ProductId);
                    if (this.fbpComponents && this.fbpComponents.length && isExistsInArr && isExistsInArr.length) {
                      addTheFBPComponentsAsItIs = this.removeObjectWithId(addTheFBPComponentsAsItIs, isExistsInArr[0].ProductId);
                      addTheFBPComponentsAsItIs.push(isExistsInArr[0]);
                    }
                  });

                }
              });
              console.log(this.fbpComponents, addTheFBPComponentsAsItIs);
              addTheFBPComponentsAsItIs.forEach(f => {
                const isExistsInArr: any = this.fbpComponents.filter(o1 => o1.ProductId == f.ProductId);
                f.DisplayName = f.DisplayName ? isExistsInArr.length > 0 ? isExistsInArr[0].DisplayName : f.Name : f.Name;
                f.Modetype = UIMode.Edit;
                f.isFBPComponent = true;
                f.IsOverridable = f.IsOveridable != null && f.IsOveridable != undefined ? f.IsOveridable : f.IsOverridable;
                if (!f.IsOverridable) {
                  f.Value = f.DefaultValue;
                }
                f.ProductCode = f.ProductCode ? f.ProductCode : f.Code;
                // f.Value = f.Value ? f.Value && isExistsInArr.length > 0 && f.Value != isExistsInArr[0].Value ?  isExistsInArr[0].Value : f.Value : f.MinimumValue;
                f.Value = (f.Value !== null && f.Value !== undefined && f.Value >= 0)
                  ? (f.Value && isExistsInArr.length > 0 && f.Value != isExistsInArr[0].Value)
                    ? isExistsInArr[0].Value : f.Value : f.MinimumValue;

                f.MaximumValue = f.MaximumValue;
                f.MinimumValue = f.MinimumValue;
                f.DefaultValue = f.DefaultValue;
                f.IsOveridable = f.IsOveridable != null && f.IsOveridable != undefined ? f.IsOveridable : f.IsOverridable;

               // this.totalFBPAmount = this.totalFBPAmount + f.Value;
                salaryComponents.push(f);
              });
              this.fbpComponents = addTheFBPComponentsAsItIs.filter((value, index, self) =>
                index === self.findIndex((t) => (
                  t.ProductId === value.ProductId && t.Code === value.Code
                ))
              );
              this.loadingScreenService.stopLoading();
              this.totalFBPAmount = Number(this.fbpComponents.map(item => item.Value).reduce((prev, next) => prev + next));
              this.totalUnallocatedAmount = Number(this.totalAllocatedAmount) - Number(this.totalFBPAmount);
              this.fbpComponents = _.orderBy(this.fbpComponents, ["DisplayOrder"], ["asc"]);
              // to remove duplicate array
              salaryComponents = salaryComponents.filter((value, index, self) =>
                index === self.findIndex((t) => (
                  t.ProductId === value.ProductId && t.ProductCode === value.ProductCode
                ))
              );
              const checkParentIdValue = salaryComponents.find(x => x.ProductId === this.FBPConfig[0].ProductIdForFBPCalculation);
              if (checkParentIdValue) {
                checkParentIdValue.Modetype = UIMode.Edit;
                checkParentIdValue.Value = checkParentIdValue.Value != this.totalUnallocatedAmount ? this.totalUnallocatedAmount : checkParentIdValue.Value;
              }
              this.salaryComponents.push(this.groupByForTable(salaryComponents));
              console.log('final ::---', this.fbpComponents, this.salaryComponents);
              this.spinner = false;
              if (this.totalUnallocatedAmount < 0) {
                this.disableSaveBtn = true;
                this.alertservice.showWarning('Cannot exceed total allocated amount !');
              }
            } else {
              this.spinner = false;
              this.showNoDataAvailable = true;
              this.showNoDataAvailableMsg = 'FBP Components are not configured. Please contact your HR Team';
            }
          }, err => {
            console.log('GET FBP COMPONENTS FOR EMP ERROR -->', err);
            this.spinner = false;
          });
        });
      }
    });

  }

  removeObjectWithId(arr, productId) {
    const objWithIdIndex = arr.findIndex((obj) => obj.ProductId === productId);

    if (objWithIdIndex > -1) {
      arr.splice(objWithIdIndex, 1);
    }

    return arr;
  }

  getsalaryBreakupDetails() {
    let datasource: DataSource = {
      Name: "GetELCDetailsUsingEmployeeId",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [
      {
        FieldName: "@employeeIds",
        Value: this.employeeId
      }
    ]
    const promise = new Promise((resolve, reject) => {
      this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
        if (result.Status && result.dynamicObject != '') {
          console.log("ELCDetails ::", JSON.parse(result.dynamicObject));
          const parsedArr = JSON.parse(result.dynamicObject);
          this.FBPSlotId = this.mode.toLowerCase() !== 'new' ? this.FBPSlotId : 0;
          this.employeeName = parsedArr && parsedArr.length ? parsedArr[0].FirstName : '';
          this.employeeCode = parsedArr && parsedArr.length ? parsedArr[0].Code : '';
          this.employeeService.getFBPConfigForAnEmployee(this.employeeId, this.FBPSlotId).subscribe((config) => {
            console.log('getFBPConfigForEmp---', config);
            if (config.Status) {
              this.isConfigFailed = false;
              this.FBPConfig = JSON.parse(config.Result);
              this.FBPSlotId = this.FBPConfig[0].FBPSlotId;
              let selectedRateSet = _.filter(parsedArr[0].EmployeeRatesets, (r => r.IsLatest));                      
              let getELCtranscation = _.filter(parsedArr[0].ELCTransactions, (e => e.IsLatest));
              this.fbpConfigELCId = Number(this.fbpConfigELCId) === 0 ? (getELCtranscation && getELCtranscation.length ? getELCtranscation[0].Id : Number(this.fbpConfigELCId)) : Number(this.fbpConfigELCId);
              if (this.mode.toLowerCase() !== 'new') {
                selectedRateSet = _.filter(parsedArr[0].EmployeeRatesets, (r => r.EmployeeLifeCycleTransactionId == this.fbpConfigELCId));
                // If there are multiple elements in selectedRateSet, set it to the last element
                selectedRateSet = selectedRateSet && selectedRateSet.length > 1 ?  _.filter(selectedRateSet, (a => a.Status == 1)) : selectedRateSet;
                getELCtranscation = _.filter(parsedArr[0].ELCTransactions, (e => e.Id == this.fbpConfigELCId));
              }
              this.latestRateset = [];
              this.latestRateset = _.cloneDeep(parsedArr);
              this.latestRateset[0].EmployeeRatesets = [];
              this.latestRateset[0].EmployeeRatesets = selectedRateSet;
              this.salaryBreakupDetails = _.cloneDeep(this.latestRateset);



              if (getELCtranscation && getELCtranscation[0].EmployeeRateset) {
                const tempArr = JSON.parse(getELCtranscation[0].EmployeeRateset);
                this.salaryBreakupDetails[0].EmployeeRatesets = tempArr && tempArr.length > 1 ? _.filter(tempArr, (a => a.Status == 1)) : tempArr;
              }
              const jsonObj = this.salaryBreakupDetails;
              this.calculateData = this.mode.toLowerCase() !== 'new' ? _.filter(jsonObj[0].ELCTransactions, (O => O.Id == this.fbpConfigELCId))[0] : _.filter(jsonObj[0].ELCTransactions, (o => o.IsLatest))[0];
              this.calculateData.EmployeeRateset = selectedRateSet && selectedRateSet.length ? selectedRateSet[0].RateSetData : [];
              this.calculateData.EmployeeRatesets = jsonObj[0].EmployeeRatesets;
              this.calculateData.EmployeeRatesets[0].EmployeeLifeCycleTransactionId = this.calculateData.Id;

              this.productForFBPCalculation = _.filter(this.salaryBreakupDetails[0].EmployeeRatesets[0].RatesetProducts, (p => p.ProductId == this.FBPConfig[0].ProductIdForFBPCalculation))[0];
              this.totalAllocatedAmount = this.mode.toLowerCase() !== 'new' ? this.FBPConfig[0].ActualAmount : this.FBPConfig[0].RP[0].value;
              this.totalUnallocatedAmount = this.mode.toLowerCase() !== 'new' ? this.FBPConfig[0].ActualAmount : undefined;
              // checks for allocated amount is 0.
              if (this.mode.toLowerCase() == 'new' && Number(this.totalAllocatedAmount) === Number(0)) {
                this.showNoDataAvailable = true;
                this.showNoDataAvailableMsg = 'FBP Configurations is incorrect or the allocated amount is 0. Please contact your HR team';
                reject();
              }
              // checks for product id is null or undefined
              if (this.mode.toLowerCase() == 'new' && this.utilityservice.isNullOrUndefined(this.FBPConfig[0].ProductIdForFBPCalculation)) {
                this.showNoDataAvailable = true;
                this.showNoDataAvailableMsg = 'FBP Configurations is incorrect or the allocated amount is 0. Please contact your HR team';
                reject();
              }
              // if (jsonObj[0].EmployeeRatesets && jsonObj[0].EmployeeRatesets.length > 1) {
              //   this.calculateData.EmployeeRatesets = _.filter(jsonObj[0].EmployeeRatesets, (i => i.IsLatest));
              // }
              this.calculateData.EmployeeRatesets[0].Modetype = UIMode.Edit;
              this.spinner = false;
              this.currentEmployeeRateSet = this.salaryBreakupDetails[0].EmployeeRatesets[0];
              console.log('RATESET ::', this.currentEmployeeRateSet);

              resolve(true);
              console.log('salary/cal', this.salaryBreakupDetails, this.calculateData);
            } else {
              this.isConfigFailed = true;
              this.showNoDataAvailable = true;
              this.alertservice.showWarning(config.Message);
              this.spinner = false;
            }
          }, error => {
            console.log('getFBPConfigForEmp::ERROR -->', error);
            this.isConfigFailed = true;
            this.spinner = false;
          });
        } else {
          this.spinner = false;
          this.showNoDataAvailable = true;
        }
      });
    })
    return promise;
  }

  groupByForTable(arr) {
    const result = _.groupBy(arr, (item) => {
      if (item.isFBPComponent) {
        return _.orderBy(['FBPComponents'], ["DisplayOrder"], ["asc"]);
      } else if (!item.isFBPComponent && item['ProductTypeCode'] == 'Earning') {
        return _.orderBy(['Fixed'], ["DisplayOrder"], ["asc"]);
      } else if ((item['ProductCode'] == 'GrossEarn' || item['ProductCode'] == 'CTC' ||
        item['ProductCode'] == 'GrossDedn' || item['ProductCode'] == 'NetPay')
        && item['ProductTypeCode'] == 'Total') {
        return _.orderBy([item['ProductCode']], ["DisplayOrder"], ["asc"]);
      } else {
        return _.orderBy([item['ProductTypeCode']], ["DisplayOrder"], ["asc"]);
      }
    });

    result.FBPHeader = [];
    // to show 
    if (result.FBPComponents) {
      const getSumOfFBPCmp = result.FBPComponents.map(item => item.Value).reduce((prev, next) => prev + next);
      const fbpTitle = {
        Id: 0,
        Value: Number(getSumOfFBPCmp),
        IsDisplayRequired: true,
        DisplayOrder: 1,
        DisplayName: 'Flexible Benefits Plan'
      }
      result.FBPHeader.push(fbpTitle);
    }
    console.log(result);
    return result;
  }

  isNumberKey(e) {
    let result = false;
    try {
      const charCode = (e.which) ? e.which : e.keyCode;
      // To Allow: Ctrl+C,Ctrl+V,Ctrl+Y,Ctrl+Z
      if ((charCode == 67 || charCode == 86 || charCode == 89 || charCode == 90) && (e.ctrlKey === true)) {
        result = true;
        // To Allow: backspace and numbers
      } else if ((charCode == 8) || (charCode >= 46 && charCode <= 57) || (charCode >= 96 && charCode <= 105)) {
        result = true;
      }
    } catch (err) { console.log('KEYPRESS-ISNUMBERKEY-CATCH', err); }
    return result;
  }

  onChangeMonthlyValue(evt: any, item: any) {
    if (!this.isNumberKey(evt)) {
      // stop character from entering input
      evt.preventDefault();
      return;
    }
    for (var i in this.fbpComponents) {
      this.fbpComponents[i].showMsg = false;
    }
    const amount = Number(evt.target.value);
    item.showMsg = false;
    this.disableSaveBtn = true;
    const isRangeCorrect = this.isBetweenRange(amount, item.MinimumValue, item.MaximumValue);
    console.log('range', isRangeCorrect);
    // check if value entered is within allowed range
    if (amount !== 0 && !isRangeCorrect) {
      item.showMsg = true;
      item.Value = item.Value;
      return;
    }
    this.disableSaveBtn = false;
    this.calculateDifferenceOfOtherProducts();
    // console.log('EVENT-KEYPRESS', item);
  }

  calculateDifferenceOfOtherProducts() {
    const fbpComponent = _.filter(this.fbpComponents, (f => f.isFBPComponent));
    const getSumOfFBPCmp = fbpComponent.map(item => item.Value).reduce((prev, next) => prev + next);
    // calculation to show on top
    this.totalFBPAmount = Number(getSumOfFBPCmp);
    this.totalUnallocatedAmount = Number(this.totalAllocatedAmount) - this.totalFBPAmount;
    // change fbp header in pay structure
    this.salaryComponents[0].FBPHeader[0].Value = this.totalFBPAmount;
    // assign difference to the actual parent product
    const selectedProductId = _.filter(this.salaryComponents[0].Fixed, (p => p.ProductId == this.FBPConfig[0].ProductIdForFBPCalculation))[0];
    selectedProductId.Value = this.totalUnallocatedAmount;
    this.productForFBPCalculation.Value = this.totalUnallocatedAmount;
    // show alert when unallocated value is zero
    if (this.totalUnallocatedAmount < 0) {
      this.disableSaveBtn = true;
      return this.alertservice.showWarning('Cannot exceed total allocated amount !');
    }
  }

  isBetweenRange(x, min, max) {
    return x >= min && x <= max;
  }

  doViewPayStructureFn() {
    this.visible = true;
  }

  doReCalculateCTCFn() {
    this.loadingScreenService.startLoading();

    const jsonObj = _.cloneDeep(this.salaryBreakupDetails);
    if (Object.keys(this.calculateData).length == 0) {
      this.calculateData = _.filter(jsonObj[0].ELCTransactions, (o => o.IsLatest))[0]; // jsonObj[0].CandidateOfferDetails.flat();
      this.calculateData.EmployeeRateset = jsonObj[0].EmployeeRatesets[0].RateSetData;
      this.calculateData.EmployeeRatesets = jsonObj[0].EmployeeRatesets;
      this.calculateData.EmployeeRatesets[0].Modetype = UIMode.Edit;
    }
    console.log('RECALCULATE', this.calculateData);
    this.employeeService.new_CalculateSalaryBreakup(this.calculateData).subscribe((result) => {
      let apiResult = result;
      console.log('CALCULATE SALARY BREAKUP', apiResult);
      if (apiResult.Status && apiResult.Result) {
        this.showSubmitBtn = true;
        this.alertservice.showSuccess('Successfully done! You can click on submit button now.');
        this.calculateData = apiResult.Result;
        this.loadingScreenService.stopLoading();
      } else {
        this.alertservice.showWarning(apiResult.Message);
      }
    }, err => {
      this.showSubmitBtn = false;
      this.alertservice.showWarning(err);
      this.loadingScreenService.stopLoading();
      console.log('CALCULATE SALARY BREAKUP ERROR -->', err);
    });
  }

  submitFbpFn(ElcStatus: any, remarksForRejection?: string) {
    console.log('clicked submit fbp', ElcStatus, remarksForRejection, this.FBPSlotId);
    this.fbpComponents.forEach(fbp => {
      const checkFBPExists = this.calculateData.EmployeeRatesets[0].RatesetProducts.filter(j => j.ProductId == fbp.ProductId);
      console.log('checkFBPExists', checkFBPExists);
      if (checkFBPExists && checkFBPExists.length == 0) {
        this.calculateData.EmployeeRatesets[0].RatesetProducts.push(fbp);
      }
    });

    if (ElcStatus == 'save') {
      ElcStatus = ELCStatus.Saved;
    }
    if (ElcStatus == 'submit') {
      ElcStatus = ELCStatus.Submitted;
    }
    if (ElcStatus == 1 || ElcStatus == 5) {
      this.SpinnerShouldhideForSave = true;
    } else {
      this.SpinnerShouldhide = true;
    }
    // ELC VIEW MODEL DATA BINDING 
    const remarks = remarksForRejection ? remarksForRejection : ' ';

    const isComingFromFBPTransaction = true;
    let submitObj: any = {};
    submitObj.Id = 0;
    submitObj.customObject1 = null;
    submitObj.customObject2 = null;
    submitObj.oldELCobj = _.clone(this.calculateData);
    submitObj.newELCobj = _.clone(this.calculateData);
    submitObj.newELCobj.Modetype = UIMode.Edit;
    console.log('SUBMIT FBP/ELC', submitObj);
    // newELCobj.EmployeeRatesets

    this.currentEmployeeRateSet = submitObj.newELCobj.EmployeeRatesets[0];
    this.employeeService.put_ELCTransactionForFBP(submitObj, isComingFromFBPTransaction, Number(this.FBPSlotId), ElcStatus, remarks, Number(this.FBPConfig[0].ProductIdForFBPCalculation),
      Number(this.totalAllocatedAmount), Number(this.totalFBPAmount), Number(this.totalUnallocatedAmount)).subscribe((response) => {
        let apiResult = response;
        console.log('SUBMIT ELC', apiResult);
        if (ElcStatus == 1 || ElcStatus == 5) {
          this.SpinnerShouldhideForSave = false;
        } else {
          this.SpinnerShouldhide = false;
        }
        if (apiResult.Status) {
          this.alertservice.showSuccess('Successfully submitted!');
          this.cancelFBP();
        } else {
          if (apiResult.Message && apiResult.Message != '') {
            this.alertservice.showWarning(apiResult.Message);
          }
        }
      }, err => {
        this.loadingScreenService.stopLoading();
        console.log('SUBMIT ELC ERROR -->', err)
      });
  }

  doConfirmSubmit(status) {
    let message = `Are you sure you want to ${status}?`
    if (!this.isManagerLogin && Number(this.totalUnallocatedAmount) === Number(0)) {
      message = `The ${this.productForFBPCalculation.DisplayName} is 0. Are you sure you want to ${status}?`
    }

    if (!this.isManagerLogin && Number(this.totalFBPAmount) === Number(0)) {
      message = `You have changed the FBP components to 0. Are you sure you want to ${status}?`
    }
    if (!this.isManagerLogin && Number(this.totalUnallocatedAmount) < 0) {
      return this.alertservice.showWarning('Cannot exceed total allocated amount !');
    }
    if (!this.isManagerLogin && this.totalFBPAmount > this.totalAllocatedAmount) {
      return this.alertservice.showWarning('Cannot exceed total allocated amount !');
    }
    this.alertservice.confirmSwal1('Confirmation!', message, "Yes, Continue", "No, Cancel").then((result) => {
      if (result) {
        this.submitFbpFn(status);
      }
    });
  }

  approveRejectFBP(action: string) {
    const status = action != 'approve' ? ELCStatus.Rejected : ELCStatus.Approved;
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: action != 'approve' ? 'Rejection Remarks' : 'Approval Remarks',
      animation: false,
      showCancelButton: true,
      input: 'textarea',
      inputPlaceholder: 'Type your message here...',
      allowEscapeKey: false,
      inputAttributes: {
        autocorrect: 'off',
        autocapitalize: 'on',
        maxlength: '120',
        'aria-label': 'Type your message here',
      },
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value.length >= 120) {
          return 'Maximum 120 characters allowed.'
        }
        if (!value && action !== 'approve') {
          return 'You need to write something!'
        }
      },

    }).then((inputValue) => {
      console.log('inputValue.value', inputValue.value);
      if (inputValue.value || inputValue.value == '') {
        this.submitFbpFn(status, inputValue.value);
      } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
    });
  }

  submitFbpPayStructureFn() {
    console.log('clicked submit');
  }

  cancelFBP() {
    this.isManagerLogin ? this.router.navigate(['app/listing/ui/FBPSubmissionList']) : this.router.navigate(['app/flexibleBenefitPlan/fbpSlotForEmployee']);
  }

  closeDrawerFn(): void {
    this.visible = false;
  }

  // doTaxCalculator() {
  //   let empTransObject = {
  //     ActionMenuName: "FBP",
  //     EmployeeId: this.employeeId,
  //     EmployeeRateSet: this.currentEmployeeRateSet,
  //     ReDirectURL: this.router.url
  //   }


  //   this.sharedDataService.SetEmployeeObjecct(empTransObject);
  //   this.router.navigate(['/app/investment/taxCalculator']);
  // }


  doTaxCalculator() {

    // let empTransObject = {
    //   ActionMenuName: "FBP",
    //   EmployeeId: this.employeeId,
    //   EmployeeRateSet: this.currentEmployeeRateSet,
    //   ReDirectURL: this.router.url
    // }


    console.log('currentEmployeeRateSet', this.currentEmployeeRateSet);

    this.fbpComponents != null && this.fbpComponents.length > 0 && this.fbpComponents.forEach(fbp => {
      const checkFBPExists = this.calculateData.EmployeeRatesets[0].RatesetProducts != null &&
        this.calculateData.EmployeeRatesets[0].RatesetProducts.length > 0 && this.calculateData.EmployeeRatesets[0].RatesetProducts.filter(j => j.ProductId == fbp.ProductId);
      console.log('checkFBPExists', checkFBPExists);
      if (checkFBPExists && checkFBPExists.length == 0) {

        if (this.currentEmployeeRateSet.RatesetProducts != null && this.currentEmployeeRateSet.RatesetProducts.length > 0)
          this.currentEmployeeRateSet.RatesetProducts.push(fbp)

      }
    });

    const modalRef = this.modalService.open(TaxcalculatorComponent, this.modalOption);
    modalRef.componentInstance.EmployeeId = this.employeeId;
    modalRef.componentInstance.employeedetails = this.salaryBreakupDetails[0];
    modalRef.componentInstance.RedirectPage = 'FBP';
    modalRef.componentInstance.LstAllDeclarationProducts = [];
    modalRef.componentInstance.selectedFinYear = 0;
    modalRef.componentInstance.IsNewTaxRegimeOpted = this.salaryBreakupDetails[0].EmploymentContracts[0].IsNewTaxRegimeOpted;
    modalRef.componentInstance.currentFinYear = 0;
    modalRef.componentInstance.currentEmployeeRateset = this.currentEmployeeRateSet;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = null;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }


}
