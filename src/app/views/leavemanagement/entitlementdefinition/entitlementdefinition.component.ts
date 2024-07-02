import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
// services 
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import * as _ from 'lodash';
import { enumHelper } from '../../../shared/directives/_enumhelper';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { EntitlementDefinition } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { DataSource, SearchElement } from '../../personalised-display/models';
import { PagelayoutService } from 'src/app/_services/service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
import { EntitlementCalendar, EntitlementCycle, RoundOffMmode, UsageLimitType } from 'src/app/_services/model/Attendance/AttendanceEnum';
import { EntitlementCycleIdentifierType, EntitlementUnitType } from 'src/app/_services/model/Attendance/LeaveEnum';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { throwIfEmpty } from 'rxjs/operators';
import { ApiResponse } from 'src/app/_services/model/Common/BaseModel';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';


@Component({
  selector: 'app-entitlementdefinition',
  templateUrl: './entitlementdefinition.component.html',
  styleUrls: ['./entitlementdefinition.component.css']
})
export class EntitlementdefinitionComponent implements OnInit {

  academicForm: FormGroup;
  _loginSessionDetails: LoginResponses;
  entitlementDefinition: EntitlementDefinition
  spinner: boolean = false;
  EntitlementList: any = [];
  EntitlementType: any = [];
  RoundOffMode: any = [];
  EntitlementCalendar: any = [];
  EntitlementCycle: any = [];
  EntitlementCycleIdentifierType: any = [];
  EntitlementUnitType: any = [];
  UsageLimitType: any = [];
  isLoading: boolean = false;
  id: any;
  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private utilsHelper: enumHelper,
    private pageLayoutService: PagelayoutService,
    private attendanceService: AttendanceService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingScreenService : LoadingScreenService


  ) {
    this.createForm();
  }

  get g() { return this.academicForm.controls; } // reactive forms validation 

  createForm() {


    this.academicForm = this.formBuilder.group({

      Id: [0],
      EntitlementId: [null],
      // EntitlementDetails: [''],
      EntitlementType: [null],
      Code: [''],
      DisplayName: [''],
      Description: [''],
      // EntitlementGroupId: [null],
      CompanyId: [5],
      ClientId: [0],
      ClientContractId: [0],
      // ApplicableTeamIdList: [null],
      // ApplicableEmployeeIdList: [null],
      // ApplicableDesignationList: [null],
      // ApplicableDepartmentList: [null],
      // ApplicableLevelList: [null],
      // ApplicableVerticalList: [null],

      IsAllowedToUseDuringNoticePeriod: [false],
      AllowCarryForward: [false],
      IsShareable: [false],
      RoundOffMode: [null],
      RoundOffValue: [null],
      IsEncasheable: [false],

      IsCreditBasedOnDOJ: [false],
      IsCreditRequired: [false],
      CreditCalendar: [null],
      CreditCycle: [null],
      CreditCycleIdentifierType: [null],
      CreditCycleIdentifier: [''], // extra prop
      CreditUnitType: [null],
      CreditUnits: [null],
      CreditScale: [''],
      CreditScaleAttribute: [null],
      CreditRuleId: [null],
      IsUpfrontCredit: [false], // extra prop
      IncludeNewJoinerArrearPeriods: [false],
      IsNewJoinerProrationRequired: [false], // extra prop

      IsLapseRequired: [false],
      LapseCalendar: [null],
      LapseCycle: [null],
      LapseCycleIdentifierType: [null],
      LapseCycleIdentifier: [''],
      LapseUnitType: [null], // extra prop
      LapseUnits: [null],
      LapseScale: [null],
      LapseScaleAttribute: [''],
      LapseRuleId: [null],
      LapseAll: [false],
      MaxBalance: [0], // extra prop

      MinBalance: [0],
      IsPaymentRequired: [false],
      IsAutoPaymentInititation: [false],
      PaymentCalendar: [null],
      PaymentCycle: [null],
      PaymentCycleIdentifierType: [null], // extra prop
      PaymentCycleIdentifier: [''],
      PaymentAmount: [0],
      PaymentScale: [''],
      PaymentScaleAttribute: [''],
      PaymentRuleId: [0],
      IsAttendanceProrationRequired: [false], // extra prop
      IsNegativeBalanceAllowed: [false],
      MaxNegativeBalanceAllowed: [0],
      NegativeBalanceScale: [''],
      NegativeBalanceScaleAttribute: [''],
      NegativeBalanceRuleId: [0],
      OverallUsageLimitType: [null], // extra prop
      OverallMinUsageLimit: [null],
      OverallMaxUsageLimit: [null],
      UtilizationCycle: [null],
      UtilizationCycleStartDate: [''],
      UtilizationCycleEndDate: [''],
      UsageLimitTypePerUtilizationCycle: [null], // extra prop
      UtilizationUnitType: [null], // extra prop
      MaxUsageLimitPerUtilizationCycle: [0],
      MinUsageInOneShot: [0],
      MaxUsageInOneShot: [''],
      IsApprovalRequired: [false],
      IsOptionRequiredToUploadDocuments: [false],
      AreSupportingDocumentsMandatory: [false], // extra prop
      IsHolidayInclusive: [false],
      // HolidayConsiderationPolicy: [null],
      ImpingeOnServicePeriod: [false],
      ConsiderEarlierUsageForContinuityIndeterminingMaxUsagePerShot: [false],
    });


  }


  ngOnInit() {

    this.loadingScreenService.startLoading();
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.EntitlementType = this.utilsHelper.transform(EntitlementType)
    this.RoundOffMode = this.utilsHelper.transform(RoundOffMmode)
    this.EntitlementCalendar = this.utilsHelper.transform(EntitlementCalendar)
    this.EntitlementCycle = this.utilsHelper.transform(EntitlementCycle)
    this.EntitlementCycleIdentifierType = this.utilsHelper.transform(EntitlementCycleIdentifierType)
    this.EntitlementUnitType = this.utilsHelper.transform(EntitlementUnitType)
    this.UsageLimitType = this.utilsHelper.transform(UsageLimitType)

    this.route.data.subscribe(data => {
      if (data.DataInterface.RowData) {
        console.log(data.DataInterface.RowData.Id);
        this.id = data.DataInterface.RowData.Id;
        console.log('data.DataInterface', data.DataInterface);
        if (this.id > 0) {
          this.onClickDropdowns(null, 'Entitlement', '');
          data.DataInterface.RowData.Status = data.DataInterface.RowData.Status == "Active" ? 1 : 0;
          this.academicForm.patchValue(data.DataInterface.RowData)
        }
        // this.editForm();
      }

    });

    this.loadingScreenService.stopLoading();

  }


  onClickDropdowns(event, nameOfDataTable, nameOfDataList) {
    this.isLoading = true;
    console.log('nameOfDataList ::', nameOfDataList);
    let i = {
      Type: 1,
      Name: "ClientContract",
      EntityType: 0,
      IsCoreEntity: false
    };
    let dataSource: DataSource, searchElements: SearchElement[] = null;
    dataSource = i;
    dataSource.IsCoreEntity = false;
    dataSource.Type = 1;
    dataSource.Name = nameOfDataTable;
    dataSource.EntityType = 0;
    this.pageLayoutService.getDataset(dataSource, searchElements).subscribe(
      data => {

        // data  = JSON.parse(data);
        this.spinner = false;
        if (data.Status == true && data.dynamicObject !== null && data.dynamicObject !== '') {
          let dataset = JSON.parse(data.dynamicObject);
          console.log('dataset', dataset);

          if (dataset != undefined && dataset != null && dataset.length > 0) {
            // for (let i = 0; i < dataset.length; ++i) {
            //   dataset[i].id = i;
            //   if (dataset[i].hasOwnProperty('Status')) {
            //     dataset[i]['Status'] = dataset[i]['Status'] == 0 ? "In-Active" : "Active";
            //   }
            // }
            nameOfDataList = dataset;
            this.isLoading = false;
            this.EntitlementList = dataset
            // nameOfDataList == 'EntitlementList' ? : null;
            // `${nameOfDataList}`  = dataset;
          }

        }
        else {
          this.isLoading = false;
          console.log('Sorry! Could not Fetch Data |', data);
        }
      },
      error => {
        this.spinner = false;
        console.log(error);
      }
    )

  }

  onSave() {
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
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.loadingScreenService.startLoading();
        this.attendanceService.UpsertEntitlementDefinition(this.academicForm.value)
          .subscribe((result) => {
            let apiResponse: ApiResponse = result;
            console.log('apiResponse', apiResponse);
            this.loadingScreenService.stopLoading();
            if (apiResponse.Status) {
              this.alertService.showSuccess(apiResponse.Message);
              this.onClose()
            }
          })

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        this.spinner = false;
      }
    })

  }

  onClose() {
    this.router.navigate(['app/listing/ui/entitlementdefinition'])

  }
}
