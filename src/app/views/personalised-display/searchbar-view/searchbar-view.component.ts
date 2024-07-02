import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { SearchElement, SearchConfiguration, RoleBasedDataSecurityConfiguration, UserBasedDataSecurityConfiguration, SearchBarAccordianToggle } from 'src/app/views/personalised-display/models';
import { InputControlType, DataSourceType, AccordianToggleType } from '../enums'
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { element } from '@angular/core/src/render3';
import { Router } from '@angular/router';
import { RowDataService } from '../row-data.service';
import { TooltipOptions } from 'ng2-tooltip-directive';
import { Observable, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { AlertService, ExcelService, SessionStorage } from 'src/app/_services/service';
import { es } from 'date-fns/locale';
import moment from 'moment';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, Role } from 'src/app/_services/model';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

import * as jsPDF from 'jspdf';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-searchbar-view',
  templateUrl: './searchbar-view.component.html',
  styleUrls: ['./searchbar-view.component.scss']
})
export class SearchbarViewComponent implements OnInit, OnChanges {


  myOptions: TooltipOptions;
  @Input() isBtnDisabledRequired : boolean = false
  @Input() searchConfiguration: SearchConfiguration;
  @Input() Content: any;
  @Input() BusinessType: any;
  @Input() disableSearchButton : boolean = false;
  @Input() toggleAccordian : Observable<SearchBarAccordianToggle>;

  @Output() searchElementValueChange = new EventEmitter();
  @Output() searchButtonClicked = new EventEmitter();
  @Output() isClose = new EventEmitter();
  @Output() onSearchBarAccordianChange = new EventEmitter();

  searchElementList: SearchElement[] = null;
  parentSearchElementList: SearchElement[] = null;
  buttonList: number[] = [0, 0, 0, 0];
  acceptedSymbols = [
    "<",
    ">",
    "=",
    "<=",
    ">="
  ];

  loginSessionDetails : any;
  userId : number;
  role : Role;
  roleId : number;

  toggleAccordianSubscription: Subscription;
  accordianText = 'Search Criteria';
  isSearchBtnDisabled : boolean = false;
  isMonthlyATReportPage: boolean = false;
  IsPunchInReport: boolean = false;
  IsInvestmentSlot: boolean = false;
  showDownloadExcelBtn: boolean = false;
  sessionDetails: LoginResponses;
  IsShiftWeekOffListingPage: boolean = false;

  isCollapsed = false;
  constructor(
    private pagelayoutService: PagelayoutService, 
    private router: Router, 
    private rowDataService: RowDataService, 
    private attendanceService: AttendanceService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    private excelService: ExcelService,
    private loadingScreenService: LoadingScreenService) { }

  ngOnInit() {
    this.myOptions = {
      'placement': 'bottom',

      'theme': 'light'
    };
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object

    this.role = this.loginSessionDetails.UIRoles[0].Role;
    this.isBtnDisabledRequired = false;
    this.searchElementList = this.searchConfiguration.SearchElementList || null;
    this.isMonthlyATReportPage = this.router.url.includes('MonthlyATReport') ? true : false;
    this.IsPunchInReport = this.router.url.includes('getPunchInPunchOutReport') ? true : false;
    this.showDownloadExcelBtn = this.router.url.includes('getPunchReportITC') ? true : false;
    this.IsInvestmentSlot = this.router.url.includes('InvesmentSlot') ? true : false;
    this.IsShiftWeekOffListingPage = this.router.url.includes('GetEmployeeWeekOffDetailsForManager') || this.router.url.includes('GetEmployeeShiftDetailForManager') || this.router.url.includes('GetShiftDetails') || this.router.url.includes('GetWeekOffDetails') ? true : false;

    // console.log(this.searchElementList);
    console.log('search config ;;', this.searchConfiguration);

    // if(this.searchElementList != null){
    //   for(var i = 0 ; i < this.searchElementList.length; ++i){
    //     if((this.searchElementList[i].InputControlType != InputControlType.TextBox) && (this.searchElementList[i].ParentFields == null || this.searchElementList[i].ParentFields == []) && (this.searchElementList[i].Value != null)){
    //       this.getDropDownList(this.searchElementList[i]);
    //     //this.searchElements[i].DropDownList = [ "Rafi", "R.V." ,"Mano","Banglore","Sudhanshu","Shabaz"]  //Make an API call to get dropdownlist using datasource property of searchElement
    //     }
    //   }
    // }


    if (this.searchElementList != null) {

      //Set up ParentDependentReadOnly
      this.searchElementList.forEach(searchElement => {
        if (searchElement.ParentFields !== null && searchElement.ParentFields.length > 0 &&
          (searchElement.ParentDependentReadOnly == undefined || 
          searchElement.ParentDependentReadOnly == null || searchElement.ParentDependentReadOnly.length <= 0)) {
            searchElement.ParentDependentReadOnly = [];
            searchElement.ParentFields.forEach(x => searchElement.ParentDependentReadOnly.push(true))
        }

        if (searchElement.ParentHasValue === undefined || searchElement.ParentHasValue === null) {
          searchElement.ParentHasValue = [];
        }

      })

      for (var i = 0; i < this.searchElementList.length; ++i) {

        //Get Drop DOown list if value is there
        if ((this.searchElementList[i].InputControlType === InputControlType.DropDown || 
            this.searchElementList[i].InputControlType === InputControlType.AutoFillTextBox ||
            this.searchElementList[i].InputControlType === InputControlType.MultiSelectDropDown
          ) &&
          ((this.searchElementList[i].Value !== null && this.searchElementList[i].Value !== '' &&
            this.searchElementList[i].Value !== "0") ||
            (this.searchElementList[i].MultipleValues !== null && this.searchElementList[i].MultipleValues.length > 0)) &&
          (this.searchElementList[i].DropDownList === null || this.searchElementList[i].DropDownList.length === 0) &&
          (this.searchElementList[i].DataSource !== null && this.searchElementList[i].DataSource.Type !== DataSourceType.FixedValues)
        ) {

          // console.log("Getting drop down for " , this.searchElementList[i]);
          this.getDropDownList(this.searchElementList[i], false);
          //this.searchElements[i].DropDownList = [ "Rafi", "R.V." ,"Mano","Banglore","Sudhanshu","Shabaz"]  //Make an API call to get dropdownlist using datasource property of searchElement
        }

        //Fill Up Parent has value and make it read only if parent does not have value
        if (this.searchElementList[i].ParentFields !== null && this.searchElementList[i].ParentFields.length > 0) {
          let doesParentsHaveValue : boolean = true;
          for (let j = 0; j < this.searchElementList[i].ParentFields.length; ++j) {

            let parent = this.searchElementList.find(element => element.FieldName == this.searchElementList[i].ParentFields[j])

            if (parent.Value == null || parent.Value == '') {
              this.searchElementList[i].ParentHasValue[j] = false;
              doesParentsHaveValue = false;
              
              if(this.searchElementList[i].ParentDependentReadOnly[j]){
                this.searchElementList[i].ReadOnly = true;
              }
            }
            else {
              this.searchElementList[i].ParentHasValue[j] = true;
            }
          }
          // if (!doesParentsHaveValue )
          // {
          //   this.searchElementList[i].ReadOnly = true;
          // }
        }

        // if (this.searchElementList[i].InputControlType === InputControlType.DatePicker) {
        //   console.log('****', this.searchElementList[i]);
        //   this.searchElementList[i].DisplayFieldInDataset = "";
        //   this.searchElementList[i].ForeignKeyColumnNameInDataset = "";
        //   this.searchElementList[i]. DefaultValue = '1900-01-01';
        // }
        
      }

      //Search Value Received on Initialise
      for (var i = 0; i < this.searchElementList.length; ++i) {
        if((this.searchElementList[i].Value !== undefined && this.searchElementList[i].Value !== null && 
          this.searchElementList[i].Value !== '' &&
        this.searchElementList[i].Value !== "0") ||
        (this.searchElementList[i].MultipleValues !== undefined && this.searchElementList[i].MultipleValues !== null && 
          this.searchElementList[i].MultipleValues.length > 0)){
          this.searchElementValueReceivedOnInitialise(this.searchElementList[i]);
        }
      }
      

    }



    if (this.searchConfiguration.ButtonIds && this.searchConfiguration.ButtonIds.length > 0) {
      this.searchConfiguration.ButtonIds.forEach(id => {
        if (id > -1)
          this.buttonList[id] = 1;
      })
    }

    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object

    this.roleId =  this.sessionService.getSessionStorage('RoleId');
    const selectedRoleDetails = this.loginSessionDetails.UIRoles.find(a => a.Role.Id == this.roleId);
    this.role = selectedRoleDetails.Role;
    this.userId = this.loginSessionDetails.UserSession.UserId;

    $('#collapsableAccordian').on('hidden.bs.collapse', () => {
      // do something...
      console.log("collapesed");

      this.onSearchBarAccordianChange.emit("collapsed");
    })

    if(this.toggleAccordian !== undefined && this.toggleAccordian !== null){
      this.toggleAccordianSubscription =  this.toggleAccordian.subscribe(toggle => {
        // console.log("toggle accordian", toggle);
        if(toggle.Type === AccordianToggleType.hide){
          $('#collapsableAccordian').collapse('hide');

          if(toggle.ChangeAccordianText){
            this.accordianText = this.getAccordianText();
            console.log("Accordian text changed" , this.accordianText);
          } 

        }
        else{
          $('#CanCollapse').collapse('show');
        }
      })
    }

    
  }

  ngOnChanges() {
    if(this.searchConfiguration !== undefined && this.searchConfiguration !== null)
      this.searchElementList = this.searchConfiguration.SearchElementList || null;
  }

  ngDoCheck() {
    if(this.searchConfiguration.SearchElementList.length !== this.searchElementList.length){
      this.searchElementList = this.searchConfiguration.SearchElementList;
    }
  }

  ngOnDestroy() {

    if(this.toggleAccordianSubscription !== undefined && this.toggleAccordianSubscription !== null)
      this.toggleAccordianSubscription.unsubscribe();
  }

  getDropDownList(searchElement: SearchElement, removeReadOnly: boolean) {

    console.log('t', searchElement);
    searchElement.ParentHasValue = [false]

    
    var parentElementList: SearchElement[] = [];
    var securitySearchElementList: SearchElement[] = [];
    searchElement.DropDownList = null;

    //Get Parent Search Element
    if (searchElement.ParentFields !== null && searchElement.ParentFields !== []) {
      this.parentSearchElementList = [];
      this.getParentSearchElements(searchElement);

      if (this.BusinessType != undefined && this.BusinessType != 3) {

        this.parentSearchElementList.length > 0 && this.parentSearchElementList[0].FieldName.toUpperCase().toString() == "@CLIENTID" ? (this.parentSearchElementList[0].ParentHasValue.push(true), this.parentSearchElementList[0].Value = Number(this.sessionService.getSessionStorage("default_SME_ClientId"))) : null;
        this.parentSearchElementList.length > 0 && this.parentSearchElementList[0].FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID" ? (this.parentSearchElementList[0].ParentHasValue.push(true), this.parentSearchElementList[0].Value = Number(this.sessionService.getSessionStorage("default_SME_ContractId"))) : null;
      }

      
      parentElementList = this.parentSearchElementList;
    }

    //Get Security Search Elements
    if(this.searchConfiguration.IsDataLevelSecurityRequired){

      let IsDataLevelSecurityRequiredForUser : boolean = false;
      let IsDataUserMapped : boolean = false;

      if(searchElement.DataSecurityConfiguration !== undefined && searchElement.DataSecurityConfiguration !== null &&
        searchElement.DataSecurityConfiguration.RoleBasedConfigurationList !== undefined &&
        searchElement.DataSecurityConfiguration.RoleBasedConfigurationList !== null &&
        searchElement.DataSecurityConfiguration.RoleBasedConfigurationList.length > 0){

        let roleBasedConfiguration : RoleBasedDataSecurityConfiguration =
        searchElement.DataSecurityConfiguration.RoleBasedConfigurationList.find( x => x.RoleCode.trim().toLowerCase() === this.role.Code.trim().toLowerCase());
     
        if(roleBasedConfiguration === undefined || roleBasedConfiguration === null){
          IsDataLevelSecurityRequiredForUser = false;
        }   
        else{

          let userBasedDataSecurityConfiguration : UserBasedDataSecurityConfiguration = null;
          if(roleBasedConfiguration.OveridedUsers !== undefined && roleBasedConfiguration.OveridedUsers !== null ){
            userBasedDataSecurityConfiguration = 
            roleBasedConfiguration.OveridedUsers.find(user => user.UserId === this.userId);
          }
          

          if(userBasedDataSecurityConfiguration !== undefined && userBasedDataSecurityConfiguration !== null){
            IsDataLevelSecurityRequiredForUser = userBasedDataSecurityConfiguration.IsDataLeverSecurityRequired;
          } 
          else{
            IsDataLevelSecurityRequiredForUser = roleBasedConfiguration.IsDataLeverSecurityRequired;
          }

        }

        IsDataUserMapped = searchElement.DataSecurityConfiguration.IsMappedData;
      }

      if(IsDataLevelSecurityRequiredForUser && IsDataUserMapped){
        securitySearchElementList = this.pagelayoutService.getSearchElementFromSecurityKeys(this.searchConfiguration.SecurityKeys , searchElement.DataSource);
      }
         
    }

    let searchElementList = parentElementList.concat(securitySearchElementList);

    // console.log("search element list ::" , searchElementList , parentElementList , securitySearchElementList);

    let msg = '';
    if (this.BusinessType != undefined && this.BusinessType != "3") {

      this.searchElementList.length > 0 && this.searchElementList.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTID").length > 0 && (this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').ParentHasValue.push(true), this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').Value = this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.searchElementList.length > 0 && this.searchElementList.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID").length > 0 && (this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').ParentHasValue.push(true), this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage("default_SME_ContractId"));
 
    }
    console.log('SearchElementList :: ', searchElementList);

    this.pagelayoutService.getDataset(searchElement.DataSource, searchElementList).subscribe(dropDownList => {
      if (removeReadOnly)
        searchElement.ReadOnly = false;

      if (dropDownList !== null && dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '') {
        searchElement.DropDownList = JSON.parse(dropDownList.dynamicObject);

      }
      else {
        // console.log(dropDownList);
      }

      if (searchElement.DropDownList == null || searchElement.DropDownList.length <= 0) {
        console.log("could not fetch list of " + searchElement.DisplayName);

        if (parentElementList !== null && parentElementList.length > 0) {
          for (let elem of parentElementList) {
            if (elem.Value == null || elem.Value === '')
              msg = msg + '\n' + elem.DisplayName;
          }
          if (msg !== '') {
            msg = 'Please insert values into fields ' + msg;
            this.alertService.showWarning(msg);
          }
        }
        searchElement.DropDownList = [];

      }

    }, error => {
      console.log("could not fetch list of" + searchElement.DisplayName, error);
      searchElement.DropDownList = [];
      searchElement.ReadOnly = false;

    })
  }

  getParentSearchElements(searchElement: SearchElement) {
    // **** This is Recursive for using multilevel parents******

    var tempList: SearchElement[] = [];
    // if(searchElement.ParentFields == null || searchElement.ParentFields == []){ 
    //   return searchElement;
    // }
    // else {
    //  tempList =  this.searchElementList.filter(element => {                                
    //     return searchElement.ParentFields.indexOf(element.FieldName) > -1;       
    //  })
    //   for(var i = 0 ; i < tempList.length; ++i){
    //     this.parentSearchElementList.push(this.getParentSearchElements(tempList[i]));
    //   }
    //   return searchElement;
    // }


    tempList = this.searchElementList.filter(element => {
      return searchElement.ParentFields.indexOf(element.FieldName) > -1;
    });

    for (var i = 0; i < tempList.length; ++i) {
      this.parentSearchElementList.push(tempList[i]);
    }


  }

  onAddProductButtonClicked() {
    this.rowDataService.dataInterface = {
      SearchElementValuesList: [],
      RowData: null
    }
    // window.open(environment.environment.NewAngularAppUrl + '/admin/product', "_self");
    this.router.navigate(['app/product/Product']);
    //this.panelTitle = "Add New Product";
  }

  onAddScaleButtonClicked() {
    this.rowDataService.dataInterface = {
      SearchElementValuesList: [],
      RowData: null
    }
    this.router.navigate(['/app/masters/scale']);
  }
  onScaleRefresh(){
    this.router.navigate(['/app/listing/ui/scalelist']);
  }

  onAddTaxCodeButtonClicked() {
    this.rowDataService.dataInterface = {
      SearchElementValuesList: [],
      RowData: null
    }
    this.router.navigate(['/app/forms/form/TaxCode']);
  }

  onClearButtonClicked() {
    sessionStorage.removeItem('SearchPanel');

    for (let i = 0; i < this.searchElementList.length; ++i) {
      if ((this.searchElementList[i].ReadOnly == false) && this.searchElementList[i].IsIncludedInDefaultSearch) {
        this.searchElementList[i].Value = null;
        this.searchElementList[i].MultipleValues = [];
      }

      if (this.searchElementList[i].InputControlType == InputControlType.DatePicker) {
        this.searchElementList[i].maxDate = null;
        this.searchElementList[i].minDate = null;
        this.searchElementList[i].DisplayValue = null;
      }

      if (this.searchElementList[i].InputControlType == InputControlType.CommaSeparatedStrings || this.searchElementList[i].InputControlType == InputControlType.CommaSeparatedNumbers) {
        this.searchElementList[i].DisplayValue = null;
      }

      if( this.searchElementList[i].ParentFields !== undefined &&
         this.searchElementList[i].ParentFields !== null && this.searchElementList[i].ParentFields.length > 0) {
        let flag = false;
        for (let j = 0; j < this.searchElementList[i].ParentFields.length; ++j) {

          let parent = this.searchElementList.find(element =>
            element.FieldName == this.searchElementList[i].ParentFields[j])

          if (parent.Value == null || parent.Value == '') {
            this.searchElementList[i].ParentHasValue[j] = false;
            
            if(this.searchElementList[i].ParentDependentReadOnly[j] == true){
              flag = true;
            }
          }
          else {
            this.searchElementList[i].ParentHasValue[j] = true;
          }
        }
        if (flag)
          this.searchElementList[i].ReadOnly = true;
      }

    }

    console.log("Search ELement list ::" ,this.searchElementList);
  }

  onSearchButtonClicked() {
    this.isCollapsed = true;
    console.log('buu', this.BusinessType, this.searchElementList);
    // checks for mandatory fields are filled by user 
    // ! this check is not applicable for PayrollAdmin (roleId is 6)
    const businessType = environment.environment.BusinessType;
    if ((Number(this.roleId) !== 6 && this.searchElementList.some( a => a.IsFieldMandatory && a.Value == null))) {
      this.alertService.showWarning('Please select all required field(s)');
      return;
    }

    if (this.BusinessType != undefined && this.BusinessType != "3") {

      this.searchElementList.length > 0 && this.searchElementList.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTID").length > 0 && (this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').ParentHasValue.push(true), this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').Value = this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.searchElementList.length > 0 && this.searchElementList.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID").length > 0 && (this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').ParentHasValue.push(true), this.searchElementList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage("default_SME_ContractId"));
 
    }
    
    console.log('this.searchElementList', this.searchElementList);
    
    if(this.searchConfiguration.SaveSearchElementsLocally != undefined && this.searchConfiguration.SaveSearchElementsLocally != null 
      && this.searchConfiguration.SaveSearchElementsLocally){
        sessionStorage.setItem('CommonSearchCriteria' , JSON.stringify(this.searchElementList));
      }

      if (this.isBtnDisabledRequired == false) {
        console.log('clicked disabled ');;
        this.searchButtonClicked.emit(this.searchElementList);
      }else {
        console.log('enabled click action ');;
      }

  }

  onClose() {
    this.isClose.emit(true);
  }

  onAddPaygroupButtonClicked() {
   // window.open(environment.environment.NewAngularAppUrl + '/admin/paygroup', "_self");
    this.router.navigate(['/app/product/paygroup']);
  }

  isForthElement(i: number) {
    // console.log('forth ', i + 1);
    return (i + 1) % 4 === 0
  }

  onOpeningDropDown(searchElement: SearchElement) {


    if (searchElement.DropDownList === null || searchElement.DropDownList.length === 0) {
      searchElement.ReadOnly = true;
      this.getDropDownList(searchElement, true)
    }
    // else if (searchElement.DropDownList.length > 0) {
    //   if (searchElement.ParentFields !== null && searchElement.ParentFields.length > 0) {
    //     searchElement.ReadOnly = true;
    //     this.getDropDownList(searchElement , true);
    //   }
    // }

  }

  onSearchElementValueChange(searchElement: SearchElement , event = null) {
    
    this.modifySearchValueBasedOnInputControlType(searchElement , event);

    //Check if event has to be fired 
    if(searchElement.FireEventOnChange){
      this.searchElementValueChange.emit(searchElement);
    }

    if (event != null && searchElement.InputControlType === InputControlType.DatePicker) {
      this.onChangeDatePicker(searchElement, event);
    }
     
    //Check if search click event has to be fired
    if (searchElement.TriggerSearchOnChange) {
      this.onSearchButtonClicked();
    }

    

    // this.searchElementList.forEach(element =>
    //   {
    //     if(searchElement.ParentFields.indexOf(element.FieldName)<0 && searchElement.FieldName != element.FieldName){
    //       element.Value = null;
    //       element.MultipleValues = [];
    //     }
    //   })

    this.searchElementList.forEach(element => {
      if (element.ParentFields !== undefined && element.ParentFields != null && element.ParentFields.length > 0) {
        let i: number;
        if ((i = element.ParentFields.indexOf(searchElement.FieldName)) >= 0) {
          element.Value = null;
          element.DropDownList = [];
          element.MultipleValues = [];
          if (searchElement.Value == null || searchElement.Value === '') {
            element.ParentHasValue[i] = false;
            if(element.ParentDependentReadOnly[i] == true){
              element.ReadOnly = true;
            }
          }
          else{
            element.ParentHasValue[i] = true;
            if(element.ParentDependentReadOnly[i] == true){
              element.ReadOnly = false;
            }
          }

          let makeReadOnly : boolean = false;
          let removeReadOnly : boolean = false
          // for (let j = 0; j < element.ParentHasValue.length; ++j) {
          //   if (element.ParentHasValue[j] == false && element.ParentDependentReadOnly[j] == true){
          //     makeReadOnly = true;
          //   }

          // }
          
          // if (makeReadOnly){
          //   element.ReadOnly = true;
          // }
          // else
          //   element.ReadOnly = false;

          this.onSearchElementValueChange(element);
        }
      }
    })

    

  }

  searchElementValueReceivedOnInitialise(searchElement : SearchElement){


    this.searchElementList.forEach(element => {
      if (element.ParentFields !== undefined && element.ParentFields != null && element.ParentFields.length > 0) {
        let i: number;
        if ((i = element.ParentFields.indexOf(searchElement.FieldName)) >= 0) {
          // element.Value = null;
          // element.MultipleValues = [];
          // element.DropDownList = [];
          if (searchElement.Value == null || searchElement.Value == '')
            element.ParentHasValue[i] = false;
          else
            element.ParentHasValue[i] = true;

          let makeReadOnly : boolean = false;
          for (let j = 0; j < element.ParentHasValue.length; ++j) {
            if (element.ParentHasValue[j] == false && element.ParentDependentReadOnly[j] == true){
              makeReadOnly = true;
            }
          }
          if (makeReadOnly){
            element.ReadOnly = true;
          }
          // else
          //   element.ReadOnly = false;

          // this.searchElementValueReceivedOnInitialise(element);
        }
      }
      // console.log("search element value received on initialise" , searchElement);

    }) 
  }

  modifySearchValueBasedOnInputControlType(searchElement : SearchElement , event = null){
    let count = 0;
    if(searchElement.InputControlType === InputControlType.CommaSeparatedNumbers){
      if(searchElement.DisplayValue === undefined || searchElement.DisplayValue === null ||searchElement.DisplayValue === ''){
        searchElement.DisplayValue = null;
        searchElement.Value = null;
      }
      else{
        let inputNumbers : number[] = searchElement.DisplayValue.split(",").map(Number);
        if(inputNumbers === undefined || inputNumbers === null || inputNumbers.length <= 0){
          searchElement.Value = null;
        }
        else{
          searchElement.Value = JSON.stringify(inputNumbers);
        }
      }
      // console.log("number" ,  inputNumbers);
      // console.log("Comma Separated values ::" , searchElement);

    }
    else if(searchElement.InputControlType === InputControlType.CommaSeparatedStrings){
      
      
      if(searchElement.DisplayValue === undefined || searchElement.DisplayValue === null ||searchElement.DisplayValue === ''){
        searchElement.DisplayValue = null;
        searchElement.Value = null
      }
      else{
        let inputStrings = searchElement.DisplayValue.split(",");
        if(inputStrings === undefined || inputStrings === null || inputStrings.length <= 0){
          searchElement.Value = null;
        }
        else{
          searchElement.Value = JSON.stringify(inputStrings);
        }
      }

      

      // console.log("number" ,  inputStrings);
      // console.log("Comma Separated values ::" , searchElement);

    }
    else if(searchElement.InputControlType === InputControlType.DatePicker){
     
      // count = count + 1;
      // alert(count)
      // console.log("Event ::" , event , searchElement);

      // If Clear button is pressed
      if(event === null){
        // HARVINDER'S CODE
        searchElement.DisplayValue = null;
        searchElement.Value = null;

        // MANO'S CODE (FOR CURRENT DATE UPDATION IN END DATE PROPERTY)
        //  searchElement.DisplayValue = moment(new Date()).format('YYYY-MM-DD') 
        // searchElement.Value =  moment(event).format("YYYY-MM-DD HH:mm:ss") 
      }
      else{
        searchElement.Value =  moment(event).format("YYYY-MM-DD HH:mm:ss");
        // console.log("Converted Value ::" , moment(event).format("YYYY-MM-DD HH:mm:ss"));
        // console.log("Search Element value changed::" , searchElement);
      }

    }
    else if(searchElement.InputControlType === InputControlType.MultiSelectDropDown){
      if(searchElement.DisplayValue === undefined || searchElement.DisplayValue === null ||searchElement.DisplayValue === '' ||
        searchElement.DisplayValue.length <= 0){
        searchElement.DisplayValue = null;
        searchElement.Value = null;
      }
      else{
        searchElement.Value = JSON.stringify(searchElement.DisplayValue);
      }
    }
  }

  isInputTypeTextBox(searchElement: SearchElement): boolean {
    return searchElement.InputControlType == InputControlType.TextBox ? true : false;
  }

  isInputTypeDropDown(searchElement: SearchElement): boolean {
    return searchElement.InputControlType == InputControlType.DropDown ? true : false;
  }

  isInputTypeMultiSelectDropDown(searchElement: SearchElement): boolean {
    return searchElement.InputControlType == InputControlType.MultiSelectDropDown ? true : false;
  }

  isInputTypeAutoFillTextBox(searchElement: SearchElement): boolean {
    return searchElement.InputControlType == InputControlType.AutoFillTextBox ? true : false;
  }

  isIncludedInDefaultSearch(searchElement: SearchElement): boolean {
    // console.log(searchElement.IsIncludedInDefaultSearch);
    return searchElement.IsIncludedInDefaultSearch;
  }

  onkeyPressed(event , searchElement : SearchElement){
    // console.log("key press event" , event);

    if(searchElement.InputControlType === InputControlType.CommaSeparatedNumbers){
      let input = (searchElement.DisplayValue != null ? searchElement.DisplayValue : '') + event.key;
      return /^(([0-9](,)?)*)+$/i.test(input)
      // console.log("Input ::" , input );
    }
    else if(searchElement.InputControlType === InputControlType.CommaSeparatedStrings){
      let input = (searchElement.DisplayValue != null ? searchElement.DisplayValue : '') + event.key;
      return /^(([a-zA-Z0-9](,)?)*)+$/i.test(input)
      // console.log("Input ::" , input );
    }
  }

  clearDatePicker(searchElement){
    searchElement.DisplayValue = null;
    // searchElement.Value = null;
  }

  getAccordianText() : string{
    
    let accordianText = '';

    for(let searchElement of this.searchElementList){
      
      if((searchElement.InputControlType === InputControlType.AutoFillTextBox || 
        searchElement.InputControlType === InputControlType.DropDown) && searchElement.Value !== undefined &&
        searchElement.Value !== null ){
          
          let selectedItem = searchElement.DropDownList.find(x => searchElement.Value === x[searchElement.ForeignKeyColumnNameInDataset]);
          
          console.log("Selected Item ::" , searchElement , selectedItem);

          if(selectedItem !== undefined && selectedItem !== null){
            let displayValue = selectedItem[searchElement.DisplayFieldInDataset];

            if(displayValue !== undefined && displayValue !== null && displayValue !== ''){
              accordianText = accordianText === '' ? displayValue : ( accordianText + " | " + displayValue );
            }
          }
        }

    }

    if(accordianText !== ''){
      return accordianText;
    }
    else{
      return "Search Criteria";
    }
  }

  downloadPunchInPunchOutReport(type: string) {
    this.loadingScreenService.startLoading();
    console.log('**PUNCH REPORT**', type, this.searchElementList);
    const sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    const roleId = sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard
    const userId = sessionDetails.UserSession.UserId;
    const clientId = this.searchElementList[0].Value;
    const attendancePeriodId = this.searchElementList[1].Value;
    const filename = `punchIn_punchOut_report_${new Date().getTime().toString()}`; 
    if ((clientId != null || clientId != undefined) && (attendancePeriodId != null || attendancePeriodId != undefined)) {
      this.attendanceService.getPunchInPunchOutReport(clientId, attendancePeriodId, userId, roleId).subscribe((result) => {
        if (result.Status && result.Result != '') {
          let apiResult = JSON.parse(result.Result);
          console.log('apiResult', apiResult);
          const exportArr = [];
          if (apiResult && apiResult.length) {
            this.loadingScreenService.stopLoading();
            apiResult.forEach(element => {
              element.attendanceStatus = '';
              if (element.FirstHalf == undefined || element.FirstHalf == 'EMPTY') {
                element.FirstHalf = '';
              } 
              if (element.SecondHalf == undefined || element.SecondHalf == 'EMPTY') {
                element.SecondHalf = '';
              }
    
              if ((element.IsHoliday || element.IsHoliday == 1) && !element.IsWeekOff) {
                element.attendanceStatus = ` ${(element.IsHoliday || element.IsHoliday == 1) && element.FirstHalf && 
                element.FirstHalf == element.SecondHalf && element.FirstHalf !== '' && 
                element.FirstHalf != null ? ` H | ${element.FirstHalf}` : `H`}`;
    
              } else  if (element.IsWeekOff && (!element.IsHoliday || element.IsHoliday == 0)) {
                element.attendanceStatus = `
                ${element.IsWeekOff && element.FirstHalf && element.FirstHalf !== '' && element.FirstHalf == element.SecondHalf 
                && element.FirstHalf != null && element.FirstHalf !== 'WeekOff' ? ` WO | ${element.FirstHalf}` : `WO`}`;
    
              } else  if (element.IsWeekOff && (element.IsHoliday || element.IsHoliday == 1)) {
                element.attendanceStatus = `
                ${element.IsWeekOff && (element.IsHoliday || element.IsHoliday == 1) && element.FirstHalf && element.FirstHalf == element.SecondHalf 
                  && element.FirstHalf !== '' && element.FirstHalf != null && element.FirstHalf !== 'WeekOff' ? ` WO | H | ${element.FirstHalf}` : `WO | H`}`;
              } else {
                element.attendanceStatus = element.IsWeekOff == true && element.FirstHalf && element.FirstHalf !== '' 
                  && element.FirstHalf != null && element.FirstHalf !== 'WeekOff' ? 'WO' : `${element.FirstHalf}  
              
                ${element.SecondHalf != element.FirstHalf && element.SecondHalf != null ? ` | ${element.SecondHalf}` : ``}`;
              }

              const tempObj = {
                'Employee Code' : element.EmployeeCode,
                'Employee Name':  element.EmployeeName,
                'Manager Name': element.ManagerName,
                'Attendance Date': moment(new Date(element.AttendanceDate)).format('DD-MM-YYYY'),
                // 'Shift' : element.Shift ? element.Shift : '',
                'Punch In Time': element.PunchInTime,
                'Punch In Address': element.PunchInAddress,
                'Punch In Remarks': element.PunchInRemarks,
                'Punch Out Time': element.PunchOutTime,
                'Punch Out Address': element.PunchOutAddress,
                'Punch Out Remarks': element.PunchOutRemarks,
                'Total Hours': element.TotalHours,
                'Status': element.attendanceStatus.replace(/(?:\r\n\s|\r|\n|\s)/g, '')
              };
              exportArr.push(tempObj);
            });
            
            console.log('exportArr', exportArr);
            if (type == 'pdf') {
              var headers = this.createHeadersForPunchInOutReport(["Employee Code", "Employee Name", "Manager Name", "Attendance Date", 
              "Punch In Time","Punch In Address","Punch In Remarks","Punch Out Time", "Punch Out Address", "Punch Out Remarks",
               "Total Hours", "Status"]);
              var doc = new jsPDF({
                orientation: 'p',
                format: 'b1',
                putOnlyUsedFonts: true
              });
              doc.table(1, 1, exportArr, headers, { autoSize: false, fontSize : 13 });
              doc.save(filename + '.pdf');
            }
    
            if (type == 'excel') {
              this.excelService.exportAsExcelFile(exportArr, filename);
            }
          }
        } else {
          this.loadingScreenService.stopLoading();
          if (result.Result != '') {
            return this.alertService.showWarning(result.Message);
          } else {
            return this.alertService.showSuccess('No data found for selected attendance period !');
          }
        }
      });
    } else {
      this.loadingScreenService.stopLoading();
      return this.alertService.showWarning('Please select all required field(s)');
    }
  }

  createHeadersForPunchInOutReport(keys) {
    var result = [];
    for (var i = 0; i < keys.length; i += 1) {
      result.push({
        'id' : keys[i],
        'name': keys[i], // .replace(/([A-Z])/g, ' $1').trim(), // to add space between
        'prompt': keys[i],
        'width': 65,
        'align': 'center',
        'padding': 0
      });
    }
    return result;
  }

  onChangeDatePicker(searchElem: SearchElement, event = null) {
    //! ITC changes : to restrict user selecting date within month period in end date
    if (event != null) {
      this.searchElementList.forEach(element => {
        if (element.ParentFields && element.ParentFields.length) {
          const hasParentField = element.ParentFields.some(x => searchElem.FieldName.includes(x));
          if (element.InputControlType === InputControlType.DatePicker && hasParentField) {
            const days = environment.environment.MaxDaysInPageLayoutDatePicker;
            const maxDate = moment(event).add(days, 'days').toDate(); // ! Later need to be coming from DB
            element['maxDate'] = maxDate; 
            element['minDate'] = event;
            element.DisplayValue = event;
            element.Value = moment(event).format("YYYY-MM-DD HH:mm:ss");
          }
        }  
      });
    }    
  }

  do_DownloadExcel() {
    this.loadingScreenService.startLoading();
    if (this.BusinessType == "3" && (Number(this.roleId) !== Number('6') 
      && this.searchElementList.some( a => a.IsFieldMandatory && a.Value == null))) {
      this.alertService.showWarning('Please select all required field(s)');
      return this.loadingScreenService.stopLoading();
    }
   
    if (this.router.url.includes('getPunchReportITC')) {
      const filename = `punchIn_punchOut_report_${new Date().getTime().toString()}`;
      console.log('see', this.searchElementList);
      const values = this.searchElementList.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
      const { '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@StartDate': startDate, '@EndDate': endDate, '@UserId': userId, '@RoleId': roleId} = values;
      this.attendanceService.getPunchInPunchOutReportForITC(userId, roleId, districtId, branchId, distributorId, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')).subscribe((result) => {
        if (result.Status && result.Result != '') {
          let apiResult = JSON.parse(result.Result);
          console.log('apiResult', apiResult);
          const exportArr = [];
          if (apiResult && apiResult.length) {
            this.loadingScreenService.stopLoading();
            apiResult.forEach(element => {
              element.attendanceStatus = '';
              if (element.FirstHalf == undefined || element.FirstHalf == 'EMPTY') {
                element.FirstHalf = '';
              } 
              if (element.SecondHalf == undefined || element.SecondHalf == 'EMPTY') {
                element.SecondHalf = '';
              }
    
              if ((element.IsHoliday || element.IsHoliday == 1) && !element.IsWeekOff) {
                element.attendanceStatus = ` ${(element.IsHoliday || element.IsHoliday == 1) && element.FirstHalf && 
                element.FirstHalf == element.SecondHalf && element.FirstHalf !== '' && 
                element.FirstHalf != null ? ` H | ${element.FirstHalf}` : `H`}`;
    
              } else  if (element.IsWeekOff && (!element.IsHoliday || element.IsHoliday == 0)) {
                element.attendanceStatus = `
                ${element.IsWeekOff && element.FirstHalf && element.FirstHalf !== '' && element.FirstHalf == element.SecondHalf 
                && element.FirstHalf != null && element.FirstHalf !== 'WeekOff' ? ` WO | ${element.FirstHalf}` : `WO`}`;
    
              } else  if (element.IsWeekOff && (element.IsHoliday || element.IsHoliday == 1)) {
                element.attendanceStatus = `
                ${element.IsWeekOff && (element.IsHoliday || element.IsHoliday == 1) && element.FirstHalf && element.FirstHalf == element.SecondHalf 
                  && element.FirstHalf !== '' && element.FirstHalf != null && element.FirstHalf !== 'WeekOff' ? ` WO | H | ${element.FirstHalf}` : `WO | H`}`;
              } else {
                element.attendanceStatus = element.IsWeekOff == true && element.FirstHalf && element.FirstHalf !== '' 
                  && element.FirstHalf != null && element.FirstHalf !== 'WeekOff' ? 'WO' : `${element.FirstHalf}  
              
                ${element.SecondHalf != element.FirstHalf && element.SecondHalf != null ? ` | ${element.SecondHalf}` : ``}`;
              }

              const tempObj = {
                'District Code': element.DistrictCode,
                'Branch Code': element.BranchCode,
                'Distributor Code': element.DistributorCode,
                'PSR Id': element.PSRId,
                // 'Employee Code' : element.EmployeeCode,
                'Employee Name':  element.EmployeeName,
               // 'Manager Name': element.ManagerName,
                'Attendance Date': moment(new Date(element.AttendanceDate)).format('DD-MM-YYYY'),
                'Punch In Time': element.PunchInTime,
                'Punch In Address': element.PunchInAddress,
                'Punch In Remarks': element.PunchInRemarks,
                'Punch Out Time': element.PunchOutTime,
                'Punch Out Address': element.PunchOutAddress,
                'Punch Out Remarks': element.PunchOutRemarks,
                'Total Hours': element.TotalHours,
                'Status': element.attendanceStatus.replace(/(?:\r\n\s|\r|\n|\s)/g, '')
              };
              exportArr.push(tempObj);
            });
            
            console.log('exportArr', exportArr);
            this.excelService.exportAsExcelFile(exportArr, filename);
          }
        } else {
          this.loadingScreenService.stopLoading();
          if (result.Result != '') {
            this.alertService.showWarning(result.Message);
            return;
          } else {
            this.alertService.showSuccess('No data found for selected date range !');
            return;
          }
        }
      });
    }
     
    
  }
}
