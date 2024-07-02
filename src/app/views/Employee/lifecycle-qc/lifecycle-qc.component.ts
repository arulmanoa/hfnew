import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { apiResult } from '../../../_services/model/apiResult';
import { SessionStorage, EmployeeService, AlertService, OnboardingService, PagelayoutService, DownloadService, FileUploadService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { EmployeeLifeCycleTransaction, ELCStatus, _EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';

import * as _ from 'lodash';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { DataSource, SearchElement } from '../../personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { EmploymentContract } from 'src/app/_services/model/Employee/EmployementContract';
import { EmployeeStatus } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ThemeService } from 'ng2-charts';
import { DocumentApprovalFor, DocumentApprovalStatus, DocumentApprovalType } from 'src/app/_services/model/Approval/DocumentApproval';
import { DomSanitizer } from '@angular/platform-browser';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-lifecycle-qc',
  templateUrl: './lifecycle-qc.component.html',
  styleUrls: ['./lifecycle-qc.component.scss']
})
export class LifecycleQcComponent implements OnInit {

  spinner : boolean = false;

  Id: any;
  employeeObject :any;
  remarks: string = '';
  employeeId : number;
  ClientId : any;

  newObj : any;
  oldObj : any;

  elcObj : EmployeeLifeCycleTransaction;
  employmentContract : EmploymentContract;
  newRateset : EmployeeRateset;
  employmentContractId : number;
  employmentContractPayCycleId : number;

  active_elcObj : EmployeeLifeCycleTransaction;

  new_location : any;
  old_location : any;
  industry : any;

  salarytypeNames = [
    { Id: 1, Name: 'CTC' },
    { Id: 2, Name: 'GROSS' },
    { Id: 3, Name: 'NetPay' },
  ];
  salaryType : string = "";

  IndustryList : any[];
  ClientLocationList : any[];

  _loginSessionDetails: LoginResponses;
  MenuId: any;
  BusinessType : any;
  UserId: any;
  UserName: any;
  RoleId: any;
  RoleCode : any;
  isAllenDigital:any;
  CompanyId: any;
  ImplementationCompanyId: any;
  workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;
  accessControl_submit: UserInterfaceControlLst = new UserInterfaceControlLst;
  accessControl_reject: UserInterfaceControlLst = new UserInterfaceControlLst;
  userAccessControl;
  Label_NewSkillCategoryName: string = "";
  Label_OldSkillCategoryName: string = "";
  Label_ZoneName: string = "";
  Label_NewLocation : string = '';
  Label_NewCity : string = '';
  Label_OldCity : string = '';
  Label_OldLocation : string = '';
  Label_OldCampus : string = null;
  Label_NewCampus : string = null;
  Label_OldCostCityCenter : string = null;
  Label_NewCostCityCenter : string = null;
  // Label_OldSkillCategory : string = null;
  // Label_NewSkillCategory : string = null;
  Label_OldZone : string = null;
  Label_NewZone : string = null;
  Label_NewIndustryName : string = null;
  Label_OldIndustryName : string = null;

  Label_NewCategory : string = null;
  Label_OldCategory : string = null;
  Label_NewDepartment : string = null;
  Label_OldDepartment : string = null;
  Label_NewDivision : string = null;
  Label_OldDivision : string = null;
  Label_NewLevel : string = null;
  Label_OldLevel : string = null;
  Label_NewJobProfile : string = null;
  Label_OldJobProfile : string = null;
  Label_NewSubEmploymentType : string = null;
  Label_OldSubEmploymentType : string = null;
  Label_NewReportingManager : string = null;
  Label_OldReportingManager : string = null;
  modalRateset : EmployeeRateset;
  oldRateset : EmployeeRateset;


  //Document Approval 
  clientApprovalTbl : any[];
  currentModalItem: any;//DocumentApprovalData;
  contentmodalurl: any;
  currentModalHeading: any;
  currentModalDetailsFormat: any;

  ApprovalStatusEnumValues: typeof
  DocumentApprovalStatus = DocumentApprovalStatus;

  ApprovalTypeEnumValues: typeof
    DocumentApprovalType = DocumentApprovalType;

  ApprovalForEnumValues: typeof
    DocumentApprovalFor = DocumentApprovalFor;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private sessionService : SessionStorage,
    private employeeService :  EmployeeService,
    private alertService : AlertService,
    private loadingService : LoadingScreenService,
    private onboardingService : OnboardingService,
    private downloadService : DownloadService,
    private pageLayoutService : PagelayoutService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,

    ) { }

  ngOnInit() {


    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    const ACID = environment.environment.ACID;
    this.isAllenDigital = (Number(ACID) === 1988 && ( this.BusinessType === 1 ||  this.BusinessType === 2)) ? true : false;

    this.route.queryParams.subscribe(params => {
      

      if (JSON.stringify(params) != JSON.stringify({})) {


        let encodedIdx = atob(params["Idx"]);
        let gridObject = atob(params["Cdx"]);

        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.employeeObject = JSON.parse(gridObject);
        console.log(this.Id , this.employeeObject);
        this.employeeId = this.employeeObject.EmployeeId;
        // this.newRateset = JSON.parse(this.employeeObject.EmployeeRatesets);
        this.ClientId = this.employeeObject.ClientId;

        this.get_employeeDetailsById(this.employeeId);
      }
      else {
        // alert('Invalid Url');
        this.router.navigateByUrl("app/elc/lifecycle_qclist");
        return;
      }
    });
  }

  get_employeeDetailsById(employeeId : number){
    this.spinner = true;
    // this.employeeService.getEmployeeDetailsById(employeeId).subscribe(

    let datasource : DataSource = {
      Name : "GetELCDetailsUsingEmployeeId",
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }

    let searctElements : SearchElement[] = [
      {
        FieldName : "@employeeIds",
        Value : employeeId
      }
    ]

    this.pageLayoutService.getDataset(datasource , searctElements).subscribe((result) => {
      console.log(result);
      this.spinner = false;
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {

        // let apiResult = result.Result;
        // let oldapiResult = result.Result;

        let apiResult = JSON.parse(result.dynamicObject)[0];
        let oldapiResult = JSON.parse(result.dynamicObject)[0];

        this.newObj = apiResult;
        this.oldObj = oldapiResult;
        console.log("new obj ::" , this.newObj);

        this.elcObj = _.orderBy(this.newObj.ELCTransactions, ["Id"], ["desc"]).find(a => a.Status == ELCStatus.Submitted || a.Status == ELCStatus.ReSubmitted || a.Status == ELCStatus.Approved || a.Status == ELCStatus.Rejected);
        this.elcObj["Gender"] = this.newObj.Gender;
        console.log("Initiated ELc" , this.elcObj );

        this.active_elcObj = _.orderBy(this.newObj.ELCTransactions, ["Id"], ["desc"]).find(a => a.Status == ELCStatus.Active);
        

        this.employmentContract = this.newObj.EmploymentContracts != null && this.newObj.EmploymentContracts.length > 0 ? _.orderBy(this.newObj.EmploymentContracts, ["Id"], ["desc"]).find(a => a.Status == 1) : null;
        console.log("Contract" , this.employmentContract);

        this.employmentContractId = this.employmentContract != null ? this.employmentContract.Id : 0;
        this.employmentContractPayCycleId = this.employmentContract != null  ? this.employmentContract.PayCycleId : 0;

        if(this.active_elcObj != undefined && (this.active_elcObj.EmployeeRatesets == undefined ||
          this.active_elcObj.EmployeeRatesets == null || this.active_elcObj.EmployeeRatesets.length == 0)){
            this.active_elcObj.EmployeeRatesets = [];
            if(this.newObj.EmployeeRatesets != null && this.newObj.EmployeeRatesets.length > 0){
              let rateset = _.orderBy(this.newObj.EmployeeRatesets, ["Id"], ["desc"]).find(a => a.Status == EmployeeStatus.Active)
              if(rateset != undefined && rateset != null )  this.active_elcObj.EmployeeRatesets.push(rateset);
            }
          }

        if(this.active_elcObj == undefined || this.active_elcObj == null){
          this.active_elcObj = this.generateElcUsingMaster();
        }

        console.log("Active ELC ::" , this.active_elcObj);

        if(typeof this.elcObj["EmployeeRateset"] == 'string' && this.elcObj["EmployeeRateset"] != ''){
          this.elcObj.EmployeeRatesets = JSON.parse(this.elcObj["EmployeeRateset"]);
       }

       //Get Document Approval list
       if(this.elcObj.DocumentApprovalLst !== undefined && this.elcObj.DocumentApprovalLst !== null){
          this.clientApprovalTbl = _.cloneDeep(this.elcObj.DocumentApprovalLst);

          for(let i = 0 ; i < this.clientApprovalTbl.length; ++i){
            this.clientApprovalTbl[i].Idx = i+1;
            this.clientApprovalTbl[i].UIStatus = this.clientApprovalTbl[i].Status;
          }
        }
        else{
          this.clientApprovalTbl = [];
        }

        if(this.employeeObject.ELCTransactionType == 2 || this.employeeObject.ELCTransactionType == 5 || 
          this.employeeObject.ELCTransactionType == 6 || this.employeeObject.ELCTransactionType == 9){
            this.salaryType = this.salarytypeNames.find(type => this.elcObj.EmployeeRatesets[0].SalaryBreakUpType == type.Id).Name;
        }

        this.get_MasterInfo("isOfferInfo");
        this.getSkillAndZone(this.elcObj.IndustryId , this.elcObj.State);

      }
      else {
        this.alertService.showWarning("Sorry! Couldn't load employee data");
      }
    } , error => {
      this.spinner = false;
      console.log(error);
      this.alertService.showWarning("Error Occured while Fetching Employee Data");
    })
  }

  generateElcUsingMaster():EmployeeLifeCycleTransaction{
    let newELCTran : EmployeeLifeCycleTransaction = new EmployeeLifeCycleTransaction();
    
    newELCTran = JSON.parse(JSON.stringify(_EmployeeLifeCycleTransaction));

    newELCTran.EmployeeId = this.newObj.EmployeeId;
    newELCTran.EmploymentContractId = this.employmentContract.Id;
    newELCTran.Designation = this.employmentContract.Designation;
    newELCTran.Location = Number(this.employmentContract.WorkLocation);
    newELCTran.State = this.employmentContract.StateId;
    newELCTran.DateOfJoining = this.employmentContract.StartDate;
    newELCTran.EndDate = this.employmentContract.EndDate;
    newELCTran.Status = ELCStatus.Active

    newELCTran.Level = this.employmentContract.Level
    newELCTran.IndustryId = this.employmentContract.IndustryId
    newELCTran.DepartmentId = this.employmentContract.DepartmentId
    newELCTran.SubEmploymentType = this.employmentContract.SubEmploymentType
    newELCTran.JobProfileId = this.employmentContract.JobProfileId
    newELCTran.Category = this.employmentContract.Category
    newELCTran.Division = this.employmentContract.Division
    newELCTran.ManagerId = this.employmentContract.ManagerId
    newELCTran.CostCityCenter = this.employmentContract.CostCityCenter
    newELCTran.ReportingLocation = this.employmentContract.ReportingLocation

    if(this.newObj.EmployeeRatesets != null && this.newObj.EmployeeRatesets.length > 0){
      let rateset = _.orderBy(this.newObj.EmployeeRatesets, ["Id"], ["desc"]).find(a => a.Status == EmployeeStatus.Active)
      if(rateset != undefined && rateset != null )  newELCTran.EmployeeRatesets.push(rateset);
    }

    return newELCTran;

    // this.ELCTransaction = newELCTran;
    // this.Active_ELC_Obj =  JSON.parse(JSON.stringify(newELCTran));

  }

  get_MasterInfo(accordion_Name){
    this.spinner = true;
    this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId ,  this.ClientId  )
      .subscribe(authorized => {
        this.spinner = false;
        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {

          if (accordion_Name == "isOfferInfo") {
            // if (this.Idx != 4) {
            let OfferInfoListGrp = JSON.parse(apiResult.Result);
            this.IndustryList = _.orderBy(OfferInfoListGrp.IndustryList, ["Name"], ["asc"]);
            this.ClientLocationList = _.orderBy(OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]);
            //this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == 4);
            console.log('INDUSTRY LIST :: ', this.IndustryList);
            //console.log('PAYGROUPD LIST :: ', this.PayGroupList);
            console.log('LOCATION LIST :: ', this.ClientLocationList);
            // }

            this.new_location = this.ClientLocationList.length > 0 ? this.ClientLocationList.find(a => a.Id == (this.elcObj != undefined && this.elcObj != null ? this.elcObj.Location : null)) : null;
            this.old_location = this.ClientLocationList.length > 0 ? this.ClientLocationList.find(a => a.Id == (this.active_elcObj != undefined && this.active_elcObj != null ? this.active_elcObj.Location : null)) : null;
            
            this.Label_NewLocation = this.new_location != null ? this.new_location.LocationName : '';
            this.Label_OldLocation = this.old_location != null ? this.old_location.LocationName : '';

            if (this.elcObj != undefined && this.elcObj != null && this.elcObj) {

              // for re-location

              if(OfferInfoListGrp.ClientCityList && OfferInfoListGrp.ClientCityList.length > 0){
                let foundNew = OfferInfoListGrp.ClientCityList.find(obj => obj.Id == this.elcObj.CityId ? this.elcObj.CityId : null)
                this.Label_NewCity = (foundNew && foundNew.Code) ? foundNew.Code : null;
              }

              if (OfferInfoListGrp.ClientReportingLocationList && OfferInfoListGrp.ClientReportingLocationList.length > 0) {
                let foundNew = OfferInfoListGrp.ClientReportingLocationList.find(obj => obj.Id == this.elcObj.ReportingLocation ? this.elcObj.ReportingLocation : null)
                this.Label_NewCampus = (foundNew && foundNew.LocationName) ? foundNew.LocationName : null;

              }

              if (OfferInfoListGrp.LstClientZone && OfferInfoListGrp.LstClientZone.length > 0) {
                let foundNew = OfferInfoListGrp.LstClientZone.find(obj => obj.Id == this.elcObj.EmploymentZone ? this.elcObj.EmploymentZone : null)
                this.Label_NewZone = (foundNew && foundNew.Name) ? foundNew.Name : null;

              }

              if (OfferInfoListGrp.LstCostCityCenter && OfferInfoListGrp.LstCostCityCenter.length > 0) {
                let foundNew = OfferInfoListGrp.LstCostCityCenter.find(obj => obj.Id == this.elcObj.CostCityCenter ? this.elcObj.CostCityCenter : null)
                this.Label_NewCostCityCenter = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              // For re-designation

              if (OfferInfoListGrp.LstEmployeeCategory && OfferInfoListGrp.LstEmployeeCategory.length > 0) {
                let foundNew = OfferInfoListGrp.LstEmployeeCategory.find(obj => obj.Id == this.elcObj.Category ? this.elcObj.Category : null)
                this.Label_NewCategory = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              if (OfferInfoListGrp.LstEmployeeDepartment && OfferInfoListGrp.LstEmployeeDepartment.length > 0) {
                let foundNew = OfferInfoListGrp.LstEmployeeDepartment.find(obj => obj.Id == this.elcObj.DepartmentId ? this.elcObj.DepartmentId : null)
                this.Label_NewDepartment = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              if (OfferInfoListGrp.LstEmployeeDivision && OfferInfoListGrp.LstEmployeeDivision.length > 0) {
                let foundNew = OfferInfoListGrp.LstEmployeeDivision.find(obj => obj.Id == this.elcObj.Division ? this.elcObj.Division : null)
                this.Label_NewDivision = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              if (OfferInfoListGrp.LstEmployeeLevel && OfferInfoListGrp.LstEmployeeLevel.length > 0) {
                let foundNew = OfferInfoListGrp.LstEmployeeLevel.find(obj => obj.Id == this.elcObj.Level ? this.elcObj.Level : null)
                this.Label_NewLevel = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              if (OfferInfoListGrp.LstJobProfile && OfferInfoListGrp.LstJobProfile.length > 0) {
                let foundNew = OfferInfoListGrp.LstJobProfile.find(obj => obj.Id == this.elcObj.JobProfileId ? this.elcObj.JobProfileId : null)
                this.Label_NewJobProfile = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              if (OfferInfoListGrp.LstSubEmploymentType && OfferInfoListGrp.LstSubEmploymentType.length > 0) {
                let foundNew = OfferInfoListGrp.LstSubEmploymentType.find(obj => obj.Id == this.elcObj.SubEmploymentType ? this.elcObj.SubEmploymentType : null)
                this.Label_NewSubEmploymentType = (foundNew && foundNew.Name) ? foundNew.Name : null;
              }

              if (OfferInfoListGrp.ReportingManagerList  && OfferInfoListGrp.ReportingManagerList .length > 0) {
                let foundNew = OfferInfoListGrp.ReportingManagerList .find(obj => obj.ManagerId == this.elcObj.ManagerId ? this.elcObj.ManagerId : null)
                this.Label_NewReportingManager = (foundNew && foundNew.ManagerName) ? foundNew.ManagerName : null;
              }
            }


            // +++++++++++++++++++++++++++++++++++++++++

              // for re-location

              if( this.labelValidator( this.employmentContract , "CityId") ){
                let objFound = _.find(OfferInfoListGrp.ClientCityList, {Id : this.employmentContract.CityId}) 
                this.Label_OldCity = (objFound && objFound.Code) ? objFound.Code : null;
              }else if(this.labelValidator( this.active_elcObj , "CityId")){
                let objFound = _.find(OfferInfoListGrp.CityId, {Id : this.active_elcObj.SubEmploymentType}) 
                this.Label_OldCity = (objFound && objFound.Code) ? objFound.Code : null;
              }else {
                this.Label_OldCity = null
              }


              if( this.labelValidator( this.employmentContract , "ReportingLocation") ){
                let objFound = _.find(OfferInfoListGrp.ClientReportingLocationList, {Id : this.employmentContract.ReportingLocation}) 
                this.Label_OldCampus = (objFound && objFound.LocationName) ? objFound.LocationName : null;
              }else if(this.labelValidator( this.active_elcObj , "ReportingLocation")){
                let objFound = _.find(OfferInfoListGrp.ClientReportingLocationList, {Id : this.active_elcObj.ReportingLocation}) 
                this.Label_OldCampus = (objFound && objFound.LocationName) ? objFound.LocationName : null;
              }else {
                this.Label_OldCampus = null
              }

              if( this.labelValidator( this.employmentContract , "EmploymentZone") ){
                let objFound = _.find(OfferInfoListGrp.LstClientZone, {Id : this.employmentContract.EmploymentZone}) 
                this.Label_OldZone = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "EmploymentZone")){
                let objFound = _.find(OfferInfoListGrp.LstClientZone, {Id : this.active_elcObj.EmploymentZone}) 
                this.Label_OldZone = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldZone = null
              }


              if( this.labelValidator( this.employmentContract , "CostCityCenter") ){
                let objFound = _.find(OfferInfoListGrp.LstCostCityCenter, {Id : this.employmentContract.CostCityCenter}) 
                this.Label_OldCostCityCenter = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "CostCityCenter")){
                let objFound = _.find(OfferInfoListGrp.LstCostCityCenter, {Id : this.active_elcObj.CostCityCenter}) 
                this.Label_OldCostCityCenter = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldCostCityCenter = null
              }

              // for re-designation

              if( this.labelValidator( this.employmentContract , "Category") ){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeCategory, {Id : this.employmentContract.Category}) 
                this.Label_OldCategory = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "Category")){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeCategory, {Id : this.active_elcObj.Category}) 
                this.Label_OldCategory = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldCategory = null
              }

            
              if( this.labelValidator( this.employmentContract , "DepartmentId") ){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeDepartment, {Id : this.employmentContract.DepartmentId}) 
                this.Label_OldDepartment = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "DepartmentId")){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeDepartment, {Id : this.active_elcObj.DepartmentId}) 
                this.Label_OldDepartment = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldDepartment = null
              }

              if( this.labelValidator( this.employmentContract , "Division") ){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeDivision, {Id : this.employmentContract.Division}) 
                this.Label_OldDivision = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "Division")){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeDivision, {Id : this.active_elcObj.Division}) 
                this.Label_OldDivision = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldDivision = null
              }

              if( this.labelValidator( this.employmentContract , "Level") ){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeLevel, {Id : this.employmentContract.Level}) 
                this.Label_OldLevel = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "Level")){
                let objFound = _.find(OfferInfoListGrp.LstEmployeeLevel, {Id : this.active_elcObj.Level}) 
                this.Label_OldLevel = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldLevel = null
              }

              if( this.labelValidator( this.employmentContract , "JobProfileId") ){
                let objFound = _.find(OfferInfoListGrp.LstJobProfile, {Id : this.employmentContract.JobProfileId}) 
                this.Label_OldJobProfile = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "JobProfileId")){
                let objFound = _.find(OfferInfoListGrp.LstJobProfile, {Id : this.active_elcObj.JobProfileId}) 
                this.Label_OldJobProfile = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldJobProfile = null
              }

              if( this.labelValidator( this.employmentContract , "SubEmploymentType") ){
                let objFound = _.find(OfferInfoListGrp.LstSubEmploymentType, {Id : this.employmentContract.SubEmploymentType}) 
                this.Label_OldSubEmploymentType = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "SubEmploymentType")){
                let objFound = _.find(OfferInfoListGrp.LstSubEmploymentType, {Id : this.active_elcObj.SubEmploymentType}) 
                this.Label_OldSubEmploymentType = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldSubEmploymentType = null
              }

              if( this.labelValidator( this.employmentContract , "ManagerId") ){
                let objFound = _.find(OfferInfoListGrp.ReportingManagerList, {ManagerId : this.employmentContract.ManagerId}) 
                this.Label_OldReportingManager = (objFound && objFound.ManagerName) ? objFound.ManagerName : null;
              }else if(this.labelValidator( this.active_elcObj , "ManagerId")){
                let objFound = _.find(OfferInfoListGrp.ReportingManagerList, {ManagerId : this.active_elcObj.ManagerId}) 
                this.Label_OldReportingManager = (objFound && objFound.ManagerName) ? objFound.ManagerName : null;
              }else {
                this.Label_OldReportingManager = null
              }

    
              if( this.labelValidator( this.employmentContract , "IndustryId") ){
                let objFound = _.find(OfferInfoListGrp.IndustryList, {Id : this.employmentContract.IndustryId}) 
                this.Label_OldIndustryName = (objFound && objFound.Name) ? objFound.Name : null;
              }else if(this.labelValidator( this.active_elcObj , "IndustryId")){
                let objFound = _.find(OfferInfoListGrp.IndustryList, {Id : this.active_elcObj.IndustryId}) 
                this.Label_OldIndustryName = (objFound && objFound.Name) ? objFound.Name : null;
              }else {
                this.Label_OldIndustryName = null
              }
              
            // +++++++++++++++++++++++++++++++++++++++++
           
          
           
            this.industry = this.IndustryList.length > 0 ? this.IndustryList.find(a => a.Id == (this.elcObj != undefined && this.elcObj != null ? this.elcObj.IndustryId : null)) : null;
            this.Label_NewIndustryName = this.industry != null ? this.industry.Name : '';

            // let industryOld =  this.IndustryList.length > 0 ? this.IndustryList.find(a => a.Id == (this.active_elcObj != undefined && this.active_elcObj != null ? this.active_elcObj.IndustryId : null)) : null;
            //  this.Label_OldIndustryName = industryOld.Name ? industryOld.Name : null;
            
            console.log(this.new_location);
            console.log(this.old_location);
            console.log(this.industry);
            
            //this.Label_LocationName = location && location.LocationName;
            //this.Idx != 4 ? this.onChangeOfferLocation(this.ClientLocationList.find(z => z.Id == this.jStr_ELC.Location), 'firstTime') : this.label_binding();
            // this.Idx != 4 ? this.onChangeOfferLocation_OLD(this.ClientLocationList.find(z => z.Id == (this.Active_ELC_Obj != undefined && this.Active_ELC_Obj != null ? this.Active_ELC_Obj.Location : this.jStr_ELC.Location)), 'firstTime') : this.label_binding();


            // this.onChangeIndustryType(null);


          }
          // else if (accordion_Name == "isOnboardingInfo") {
          //   let OnBoardingInfoListGrp: OnBoardingInfo = JSON.parse(apiResult.Result);
          //   this.ClientList = _.orderBy(OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);
          //   console.log('CLIENT LIST ::', this.ClientList);
          //   this.Label_ClientName = this.ClientList.length > 0 ? this.ClientList.find(a => a.Id == this.ClientId).Name : null;

          // }

        }
        

      }, (error) => {
        this.spinner = false;

      });
  }

  getSkillAndZone(industryId : number , stateId : number){
    console.log("getting skill and zone for" , industryId , stateId);

    this.onboardingService.getSkillaAndZoneByStateAndIndustry(industryId, stateId)
    .subscribe(response => {

      const apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result != "") {

        let OfferInfoListGrp1 = JSON.parse(apiResult.Result);
        let SkillCategoryList = OfferInfoListGrp1.SkillCategoryList;
        let ZoneList = OfferInfoListGrp1.ZoneList;

        console.log('SKILLS AND ZONE :: ', OfferInfoListGrp1);

        let skillCategory = SkillCategoryList != null &&  SkillCategoryList.length > 0 ? SkillCategoryList.find(a => a.Id == (this.elcObj != undefined && this.elcObj != null ? this.elcObj.SkillCategory : null)) : null;
        let skillCategoryold = SkillCategoryList != null &&  SkillCategoryList.length > 0 ? SkillCategoryList.find(a => a.Id == (this.active_elcObj != undefined && this.active_elcObj != null ? this.active_elcObj.SkillCategory : null)) : null;
        this.Label_NewSkillCategoryName = skillCategory && skillCategory.Name;
        this.Label_OldSkillCategoryName = skillCategoryold.Name ? skillCategoryold.Name : null;
        let zone = ZoneList != null && ZoneList.length > 0 ?  ZoneList.find(a => a.Id == (this.elcObj != undefined && this.elcObj != null ? this.elcObj.Zone : null)) : null;
        this.Label_ZoneName = zone && zone.Name;


      }
    },
      ((err) => {

      }));
  }


  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Any unsaved data will be lost!, Are you sure you want to close this form?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.router.navigateByUrl("app/elc/lifecycle_qclist");

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })
    
  }

  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(e) {

  //   if (window.pageYOffset > 350) {
  //     let element = document.getElementById('navbar');
  //     element.classList.add('sticky');
  //   } else {
  //     let element = document.getElementById('navbar');
  //     element.classList.remove('sticky');
  //   }
  // }

  viewProof(item){
    if(item.ObjectStorageId !== undefined && item.ObjectStorageId !== null && item.ObjectStorageId > 0){
      this.loadingService.startLoading();
      let openDocumentPromise  =  this.downloadService.GetAndViewDocumentOnNewTab(item.ObjectStorageId);

      openDocumentPromise.then((resolvedData : any) => {
        this.loadingService.stopLoading();
        this.alertService.showSuccess(resolvedData.Message);
      } , (rejectedData : any) => {
        this.loadingService.stopLoading();
        this.alertService.showWarning(rejectedData.Message);
      }).catch((rejectedData : any) => {
        this.loadingService.stopLoading();
        console.error(rejectedData);
        this.alertService.showWarning("Unexpented Error occured!");
        
      })

    }
  }

  openmodalpopupdocument(item: any) {

    console.log("Client Approval ::" , item);

    this.currentModalDetailsFormat = '';
    this.currentModalHeading = '';
    this.currentModalItem = null;
    this.contentmodalurl = null;

    this.currentModalItem = item;
    this.currentModalHeading = this.ApprovalForEnumValues[item.DocumentApprovalFor];
    this.currentModalDetailsFormat = 'Document Details';

    $('#modaldocumentviewer').modal('show');

    var contentType = this.fileUploadService.getContentType(item.DocumentName);

    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileUploadService.getObjectById(item.ObjectStorageId)
        .subscribe(dataRes => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
            //handle error
          }
          let file = null;

          var objDtls = dataRes.Result;
          // var contentType = this.objectApi.getContentType(objDtls.ObjectName);
          // if(contentType == '')
          // {
          //   contentType = objDtls.Attribute1;
          // }

          const byteArray = atob(objDtls.Content);
          const blob = new Blob([byteArray], { type: contentType });
          file = new File([blob], objDtls.ObjectName, {
            type: contentType,
            lastModified: Date.now()
          });


          if (file !== null) {

            //const newPdfWindow = window.open('', '');
            var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
            // this.sanitizer.sanitize(SecurityContext.URL, urll);
            this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            console.log(this.contentmodalurl);
          }
          // // tslint:disable-next-line:max-line-length
          // const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

          // const iframeEnd = '\'><\/iframe>';

          // newPdfWindow.document.write(iframeStart + content + iframeEnd);
          // newPdfWindow.document.title = data.OriginalFileName;
          // // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // alert('Preview not avilable for word document. please download instead...');

      //const newPdfWindow = window.open('', '');

      //const content = DocumentId;
      var appUrl = this.fileUploadService.getUrlToGetObject(item.ObjectStorageId);
      // tslint:disable-next-line:quotemark..change this
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
      console.log(this.contentmodalurl);
      // this.contentmodalurl = "'https://docs.google.com/gview?url='http://localhost:59271/api/GetObject/GetObject/556/0x7E09A16E7FE8EFCA39219EDC035BBC4DD8116DF1FC4AB062CC6AA3E79AD224359416DA6D5E0689F221E1A1EB9D143B38BE05&embedded=true'"
      // const srcUrl = this.apiEndpoints.BASE_URL + this.apiEndpoints.BASE_FETCHDOCUMENTBYTES_ENDPOINT;
      // const iframeUrlParams = 'DocumentId=';
      // // tslint:disable-next-line:quotemark
      //const iframeEnd = "&embedded=true'";
      // newPdfWindow.document.write(iframeStart + srcUrl + iframeUrlParams + content + iframeEnd);
      // newPdfWindow.document.title = data.OriginalFileName;


    }

    //---------------------------------




  }

  validateDocument(isApproval: boolean) {
    
    if (!isApproval) {

      if (this.currentModalItem.Remarks === null || this.currentModalItem.Remarks === undefined || this.currentModalItem.Remarks.trim() == '') {
        this.alertService.showWarning("Please give remarks/rejection reasons and try again!")
        return;
      }
    }

    this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to ' + (isApproval ? 'Approve' : 'Reject') + ' this record?', "Yes, Proceed").then(result => {
      // this.loadingScreenService.startLoading();
      this.currentModalItem.Status = isApproval ? DocumentApprovalStatus.Approved : DocumentApprovalStatus.Rejected;
      
      $('#modaldocumentviewer').modal('hide');
      // this.loadingScreenService.stopLoading()
    })
      .catch(error => 
        {

        }
        // this.loadingScreenService.stopLoading()
      );
    
    console.log("Client approval tbl ::" , this.clientApprovalTbl);  
      
  }

  updateQcELCTransaction(isApproved : boolean){

    if(!isApproved && this.remarks == ''){
      this.alertService.showWarning("Please input remarks for rejection");
      return;
    }



    if(this.clientApprovalTbl !== undefined && this.clientApprovalTbl !== null && this.clientApprovalTbl.length > 0){

      let notVerifiedDocuments = this.clientApprovalTbl.filter(x => x.Status === DocumentApprovalStatus.Pending);

      if(notVerifiedDocuments !== undefined && notVerifiedDocuments !== null && notVerifiedDocuments.length > 0){
        this.alertService.showWarning("Please verify all the approvals");
        return;
      }

      for(let documentApproval of this.clientApprovalTbl){
        let elcDocumentApproval = this.elcObj.DocumentApprovalIds.find(x => x.DocumentApprovalId === documentApproval.Id);
  
        if(elcDocumentApproval !== undefined && elcDocumentApproval != null){
          elcDocumentApproval.Status = documentApproval.Status;
          elcDocumentApproval.Remarks = documentApproval.Remarks;
        }
  
        documentApproval.ModeType = UIMode.None;
      }
    }

    

    this.elcObj.Status = isApproved? ELCStatus.Approved : ELCStatus.Rejected;
    this.elcObj.QcRemarks = this.remarks;

    console.log("ELC before save ::" , this.elcObj);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {



        
    
        this.workFlowInitiation.Remarks = this.remarks;//this.objCandidateQualityCheckModel.OverallRemarks;
        this.workFlowInitiation.EntityId = this.elcObj.EmployeeId;
        this.workFlowInitiation.EntityType = EntityType.Employee;
        this.workFlowInitiation.CompanyId = this._loginSessionDetails.Company.Id;
        this.workFlowInitiation.ClientContractId = this.elcObj.ClientContractId;
        this.workFlowInitiation.ClientId = this.elcObj.ClientId;
    
        this.workFlowInitiation.ActionProcessingStatus = 15500;
        this.workFlowInitiation.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId;
        this.workFlowInitiation.WorkFlowAction = isApproved ? 69 : 68;
        this.workFlowInitiation.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
        this.workFlowInitiation.DependentObject = { 
          "ClientContractId" : this.elcObj.ClientContractId,
          "EmployeeLifeCycleTransaction": this.elcObj 
        };
        this.workFlowInitiation.UserInterfaceControlLst = this.userAccessControl.filter(a => a.ControlName == "btn_qc_submit");
        
        this.loadingService.startLoading();
        this.employeeService.post_ELCWorkFlow(this.workFlowInitiation).subscribe(response => {
          this.loadingService.stopLoading();
          if(response.Status){
            this.alertService.showSuccess("ELC updated successfully");
            this.router.navigate(["/app/elc/lifecycle_qclist"]);
          }
          else {
            console.log(response);
            this.alertService.showWarning("Sorry , couldn't update ELC!");
          }

        } , error => {
          console.log(error);
          this.loadingService.stopLoading();
          this.alertService.showWarning("Error occured! Couldn't update ELC")
        })

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }

  onClickingViewProofButton(){
    $('#popup_client_approval').modal('show');
  }

  onClickingPreviewCTCButton(index : string){
    console.log("Preview ctc clicked");
    if(index == 'new'){
      this.modalRateset = this.elcObj.EmployeeRatesets[0];
      console.log(this.elcObj);
    }
    if(index == 'old'){
      this.modalRateset =  this.active_elcObj.EmployeeRatesets[0];
      console.log(this.active_elcObj);
    }
    console.log(this.modalRateset);
    $('#popup_salary_breakup').modal('show');
  }

  modal_dismiss_Current_SalaryBreakup() {

    $('#popup_salary_breakup').modal('hide');
  }

  
  modal_dismiss_client_approval(){
    $('#popup_client_approval').modal('hide');

  }

  model_dismiss_viewDocument(){
    $('#modaldocumentviewer').modal('hide');

  }


  labelValidator(dataObject, findAttribute){
    let exceptionList = [null, "", undefined, 0]
    if (dataObject.hasOwnProperty(findAttribute) && !exceptionList.includes(dataObject[findAttribute])){
      return true;
    }else {
      return false;
    }
  }


  

}
