import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { PageLayout } from 'src/app/views/personalised-display/models';
import { SearchPanelType, DataSourceType } from 'src/app/views/personalised-display/enums';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { PayoutInformationDetails, PayoutInformation, PayOutStatus, PayOutDetailsStatus } from 'src/app/_services/model/Payroll/PayOut';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import * as _ from 'lodash';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters, Formatters, OnEventArgs } from 'angular-slickgrid';

@Component({
  selector: 'app-payout-viewrequest-modal',
  templateUrl: './payout-viewrequest-modal.component.html',
  styleUrls: ['./payout-viewrequest-modal.component.css']
})
export class PayoutViewrequestModalComponent implements OnInit {

  @Input() lstSelectedObj: any;
  @Input() ROLE: any;

  BatchIds: any;
  sessionDetails: LoginResponses;
  RoleId; UserId; PersonName;

  isrendering_spinner: boolean = false;
  lstPayoutInformation = [];
  pageLayout: PageLayout = null;
  dataset = [];
  selectAll: any;
  // selectedEmployees = [];
  totalNoOfEmps: number = 0;
  BusinessType: any;

  BehaviourObject_Data: any;
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];
  inEmployeesInitiateSelectedItems: any[];

  constructor(
    private pageLayoutService: PagelayoutService,
    private activeModal: NgbActiveModal,
    private payrollService: PayrollService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    public sessionService: SessionStorage,


  ) { }

  ngOnInit() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.PersonName = this.sessionDetails.UserSession.PersonName;
    this.isrendering_spinner = true;
    this.lstPayoutInformation = [];
    this.inEmployeesInitiateSelectedItems = [];
    this.lstSelectedObj = JSON.parse(this.lstSelectedObj)
    this.collect_BatchIds();
    this.loadinEmployeesInitiateRecords();
    // this.property_Builder();

  }

  collect_BatchIds() {

    let BatchId = [];
    this.lstSelectedObj.forEach(element => {
      BatchId.push(element.Id)
    });
    console.log('selectedItems', this.lstSelectedObj);
    this.BatchIds = (BatchId).join(",");
    this.getDataset_manually();
  }

  async getDataset_manually() {
    this.pageLayout = {

      Description: "custom",
      Code: "payout",
      CompanyId: 1,
      ClientId: 2,
      SearchConfiguration: {
        SearchElementList: [
        ],
        SearchPanelType: SearchPanelType.Panel
      },
      GridConfiguration: {
        ColumnDefinitionList: [],
        DataSource: {
          Type: DataSourceType.View,
          Name: 'Any'
        },

        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,
        IsSummaryRequired: true,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,
      },
      PageProperties: {
        PageTitle: "Any List",
        BannerText: "Any",
      }
    }
    this.pageLayout.GridConfiguration.DataSource = null;
    this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'GET_EMPLOYEELISTUSING_PAYOUTID_EDIT' }
    this.pageLayout.SearchConfiguration.SearchElementList.push(

      {
        "DisplayName": "PayOutIds",
        "FieldName": "PayOutIds",
        "InputControlType": 0,
        "Value": this.BatchIds,
        "MultipleValues": null,
        "RelationalOperatorsRequired": false,
        "RelationalOperatorValue": null,
        "DataSource": {
          "Type": 0,
          "Name": null,
          "EntityType": 0,
          "IsCoreEntity": false
        },
        "IsIncludedInDefaultSearch": true,
        "DropDownList": [],
        "ForeignKeyColumnNameInDataset": null,
        "DisplayFieldInDataset": null,
        "ParentFields": null,
        "ReadOnly": false,
        "TriggerSearchOnChange": false
      });

    this.dataset = [];
    await this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.dataset = JSON.parse(dataset.dynamicObject);
        console.log("Dataset ::" , this.dataset);
        this.inEmployeesInitiateList = JSON.parse(dataset.dynamicObject);
        this.property_Builder();
        this.isrendering_spinner = false;
      }
      else {
        this.isrendering_spinner = false;
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      console.log(error);
    })
  }

  property_Builder() {

    this.lstPayoutInformation = [];
    let payoutInfoDetails = new PayoutInformationDetails();
    this.lstSelectedObj.forEach(ele => {
      let lstPayoutDet = [];
      let payout = new PayoutInformation();
      payout["id"] = ele.Id;
      payout["ClientCode"] = ele.ClientCode;
      payout["PayOutAmount"] = ele.PayOutAmount;
      payout["PayPeriod"] = ele.PayPeriod;
      payout["PayStatus"] = ele.PayStatus;
      payout.Id = ele.Id;
      payout.ClientId = ele.clientId
      payout.ClientContractId = ele.clientcontractId
      payout.ClientName = ele.ClientName
      payout.CompanyBankAccountId = ele.CompanyBankAccountId
      payout.Status = ele.StatusCode
      payout['isSelected'] = false
      // lstPayoutDet.push(this.dataset.filter(z=>z.PayOutInformationId == ele.Id))
      this.dataset.forEach(z => {
        if (z.PayOutInformationId == ele.Id) {
          lstPayoutDet.push(z)
        }

      });
      this.totalNoOfEmps = lstPayoutDet.length;
      payout.LstPayoutInformationDetails = lstPayoutDet;
      this.lstPayoutInformation.push(payout)
      console.log(this.lstPayoutInformation);


    });

  }

  // unused code - this is for checkbox selection stuff
  // selectAllEmp(event) {
  //   this.selectedEmployees = [];
  //   this.lstPayoutInformation.forEach(e => {
  //     e.LstPayoutInformationDetails.map((i) => {
  //       event.target.checked == true ? i.isSelected = true : i.isSelected = false;
  //     })
  //   });
  //   if (event.target.checked) {
  //     this.lstPayoutInformation.forEach(e => {
  //       e.LstPayoutInformationDetails.map((i) => {
  //         this.selectedEmployees.push(i);
  //       });
  //     });
  //   } else {
  //     this.selectedEmployees = [];
  //   }
  //   console.log('selected', this.selectedEmployees);


  // }
  // onCheckEmployee(obj, parentObj, eventt) {
  //   let updateItem = parentObj.LstPayoutInformationDetails.find(i => i.Id == obj.Id);
  //   let index = this.selectedEmployees.indexOf(updateItem);
  //   console.log(index);
  //   if (index > -1) {
  //     this.selectedEmployees.splice(index, 1);
  //   }
  //   else {
  //     this.selectedEmployees.push(obj);
  //   }
  //   var totalLength = 0;
  //   this.lstPayoutInformation.forEach(e => {
  //     e.LstPayoutInformationDetails.map((i) => {
  //       totalLength = totalLength + 1;;
  //     });
  //   });
  //   if (totalLength === this.selectedEmployees.length) {
  //     this.selectAll = true;
  //   }
  //   else {
  //     this.selectAll = false;
  //   }

  // }
  // findIndexToUpdate(obj) {
  //   return obj.Id === this;
  // }

  getTotalCount() {
    var sum = 0;
    for (let index = 0; index < this.lstPayoutInformation.length; index++) {
      const element = this.lstPayoutInformation[index].LstPayoutInformationDetails;
      element.forEach(e => { sum += parseInt(e.NetPay) })
      return sum
    }
  }

  do_approveorhold_payout(indexOf) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Review and Confirm changes`,
      text: indexOf === "Approve" ? "Are you sure you want to Approve this request?" : "Are you sure you want to Hold this request?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Continue",
      cancelButtonText: 'No, Cancel!',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {

        this.loadingScreenService.startLoading();
        let lstPayout_UpdatedDet = [];
        this.lstSelectedObj.forEach(obj => {
          let submitobjePayOut = new PayoutInformation();
          submitobjePayOut.Id = obj.Id;
          submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
          submitobjePayOut.ClientId = obj.clientId;
          submitobjePayOut.ClientContractId = obj.clientcontractId;
          submitobjePayOut.ClientName = obj.ClientName
          submitobjePayOut.CompanyBankAccountId = obj.CompanyBankAccountId;
          submitobjePayOut.ApprovedId = this.UserId;
          indexOf == "Approve" ? submitobjePayOut.Status = PayOutStatus.Approved : submitobjePayOut.Status = PayOutStatus.Hold;
          submitobjePayOut.LstPayoutInformationDetails = [];
          lstPayout_UpdatedDet.push(submitobjePayOut)
        });
        this.payrollService.put_UpdatePayoutInformation(lstPayout_UpdatedDet)
          .subscribe((result) => {
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.activeModal.close('Success')
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, err => {
            this.loadingScreenService.stopLoading();

          })

      } else if (
        res.dismiss === Swal.DismissReason.cancel

      ) {
        this.loadingScreenService.stopLoading();
      }
    })
  }
  do_delete_selctedEmp() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Are you sure you want to remove this Employee?`,
      text: "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: 'Not now',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {
        const LstRemoveEmployees = [];
        this.inEmployeesInitiateSelectedItems.forEach(item => {
          var rmObject = new PayoutInformationDetails();
          rmObject.Id = item.Id;
          rmObject.PayoutInformationId = item.PayoutInformationId;
          rmObject.TimeCardId = item.TimeCardId;
          rmObject.EmployeeId = item.EmployeeId;
          rmObject.EmployeeName = item.EmployeeName;
          rmObject.Status = PayOutDetailsStatus.Initiated;
          rmObject.ModeType = UIMode.Delete;
          LstRemoveEmployees.push(rmObject);

        });


        this.payrollService.remove_PayoutInformationDetails(JSON.stringify(LstRemoveEmployees))
          .subscribe((result) => {
            console.log('REMOVE FOR PAYOUT EMPLOYEE RESPONSE :: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              for (let index = 0; index < this.lstPayoutInformation.length; index++) {
                const element = this.lstPayoutInformation[index].LstPayoutInformationDetails;
                this.inEmployeesInitiateSelectedItems.forEach(e => {
                  this.inEmployeesInitiateGridInstance.gridService.deleteDataGridItemById(e.Id);
                  // const indexs: number = element.indexOf(e);
                  // if (indexs !== -1) {
                  //   element.splice(indexs, 1);
                  // }
                });
              }

              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });
      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })

  }


  remove_Employee(item) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Are you sure you want to remove this Employee?`,
      text: "Once deleted, you cannot undo this action.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: 'Not now',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {

        const LstRemoveEmployees = [];
        var rmObject = new PayoutInformationDetails();
        rmObject.Id = item.Id;
        rmObject.PayoutInformationId = item.PayoutInformationId;
        rmObject.TimeCardId = item.TimeCardId;
        rmObject.EmployeeId = item.EmployeeId;
        rmObject.EmployeeName = item.EmployeeName;
        rmObject.Status = PayOutDetailsStatus.Initiated;
        rmObject.ModeType = UIMode.Delete;
        LstRemoveEmployees.push(rmObject);
        this.payrollService.remove_PayoutInformationDetails(JSON.stringify(LstRemoveEmployees))
          .subscribe((result) => {
            console.log('REMOVE FOR PAYOUT EMPLOYEE RESPONSE :: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status) {
              // for (let index = 0; index < this.lstPayoutInformation.length; index++) {
              //   const element = this.lstPayoutInformation[index].LstPayoutInformationDetails;
              //   const indexs: number = element.indexOf(item);
              //   if (indexs !== -1) {
              //     element.splice(indexs, 1);
              //   }
              // }
              this.inEmployeesInitiateGridInstance.gridService.deleteDataGridItemById(item.Id);
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });
      } else if (res.dismiss === Swal.DismissReason.cancel) {
      }
    })

  }

  Confirm() {
    this.activeModal.close('Success');
  }
  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  loadinEmployeesInitiateRecords() {

    this.inEmployeesInitiateGridOptions = {
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: true,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: true,
      //For Footer Summary
      createFooterRow: true,
      showFooterRow: false,
      footerRowHeight: 30,
      //For Grouping
      createPreHeaderPanel: true,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 40,
      enablePagination: false,
      enableCheckboxSelector: true,
      enableRowSelection: true,
      rowSelectionOptions: {
        selectActiveRow: false
      }
    };

    this.inEmployeesInitiateColumnDefinitions = [
      {
        id: 'EmployeeCode', name: 'Employee Code', field: "EmployeeCode",
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'MobileNumber', name: 'Mobile No.', field: 'MobileNumber',
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: 'AccountNumber', name: 'Acc. No.', field: 'AccountNumber',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },

      {
        id: 'NetPay', name: 'Net Pay', field: 'NetPay',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'AcknowledgmentDetail', name: 'UTR', field: 'AcknowledgmentDetail',
        sortable: true,
        type: FieldType.string,
        filterable: true

      },
      {
        id: 'Status', name: 'Status.', field: 'Status',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'delete',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.remove_Employee(args.dataContext)
        }
      },

    ];
  }

  onSelectedEmployeeChange(data, args) {
    this.inEmployeesInitiateSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesInitiateDataView.getItem(row);
        this.inEmployeesInitiateSelectedItems.push(row_data);
      }
    }    
    console.log('SELECTED ITEMS SO :', this.inEmployeesInitiateSelectedItems);
  }


}
