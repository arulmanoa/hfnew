import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { NgxSpinnerModule } from "ngx-spinner";
import { NgSelectModule } from '@ng-select/ng-select';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule, MatDialogModule } from '@angular/material';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NZ_I18N, en_US } from "ng-zorro-antd";
import { NgZorroAntdModule, NZ_ICONS } from "ng-zorro-antd";
import { NzTableModule } from 'ng-zorro-antd/table';
import { IconDefinition } from "@ant-design/icons-angular";
import * as AllIcons from "@ant-design/icons-angular/icons";
import { TooltipModule } from 'ng2-tooltip-directive';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { TextMaskModule } from 'angular2-text-mask';
import { WebcamModule } from 'ngx-webcam';
import { AgmCoreModule } from '@agm/core';

//modal imports
import { StatesModalComponent } from './modals/states-modal/states-modal.component';
import { ConfigureDataSourceModalComponent } from './modals/generic-import-modals/configure-data-source-modal/configure-data-source-modal.component';
import { ConfigureImportInputModalComponent } from './modals/generic-import-modals/configure-import-input-modal/configure-import-input-modal.component';
import { SaleorderModalComponent } from './modals/payroll/saleorder-modal/saleorder-modal.component';
import { AddemployeeModalComponent } from './modals/payroll/addemployee-modal/addemployee-modal.component';
import { PayoutFinanceModalComponent } from './modals/payroll/payout-finance-modal/payout-finance-modal.component';
import { PayoutViewrequestModalComponent } from './modals/payroll/payout-viewrequest-modal/payout-viewrequest-modal.component';
import { InitiateSaleOrderModalComponent } from './modals/payroll/initiate-sale-order-modal/initiate-sale-order-modal.component';
import { AttendancelogModalComponent } from './modals/payroll/attendancelog-modal/attendancelog-modal.component';
import { RemarksModalComponent } from './modals/remarks-modal/remarks-modal.component';
import { LossfromhousepropModalComponent } from './modals/employee/lossfromhouseprop-modal/lossfromhouseprop-modal.component';
import { MedicdependentModalComponent } from './modals/employee/medicdependent-modal/medicdependent-modal.component';
import { ConfirmationAlertModalComponent } from './modals/common/confirmation-alert-modal/confirmation-alert-modal.component';
import { PayrollhistorylogModalComponent } from './modals/payroll/payrollhistorylog-modal/payrollhistorylog-modal.component';
import { InvoiceModalComponent } from './modals/invoices/invoice-modal/invoice-modal.component';
import { EmploymentcontractSeparationComponent } from './modals/payroll/employmentcontract-separation/employmentcontract-separation.component';
import { ElcApprovalModalComponent } from './modals/elc-approval-modal/elc-approval-modal.component';
import { PaymentstatusComponent } from './modals/payroll/paymentstatus/paymentstatus.component';
import { AttendanceRequestComponent } from './modals/attendance/attendance-request/attendance-request.component';
import { CustomActionFormatterComponent } from './modals/customactionformatter/customactionformatter.component';
import { LeaveregularizeComponent } from './modals/leaveManagement/leaveregularize/leaveregularize.component';
import { ImagecaptureModalComponent } from './modals/attendance/imagecapture-modal/imagecapture-modal.component';
import { EmployeeleaverequestModalComponent } from './modals/leaveManagement/employeeleaverequest-modal/employeeleaverequest-modal.component';
import { EmployeebulkattendanceModalComponent } from './modals/attendance/employeebulkattendance-modal/employeebulkattendance-modal.component';
import { CommunicationModalComponent } from './modals/communication-modal/communication-modal.component';
import { Genericimport2ModalComponent } from './modals/generic-import-modals/genericimport2/genericimport2modal.component';
import { WebviewModalComponent } from './modals/webview-modal/webview-modal.component';
import { RegularizeleaverequestModalComponent } from './modals/attendance/regularizeleaverequest-modal/regularizeleaverequest-modal.component';
import { AddexpenseModalComponent } from './modals/expense/addexpense-modal/addexpense-modal.component';
import { ViewdocsModalComponent } from './modals/expense/viewdocs-modal/viewdocs-modal.component';
import { ImageviewerComponent } from './modals/imageviewer/imageviewer.component';
import { MultiButtonWidgetComponent } from './modals/common/multi-button-widget/multi-button-widget.component';
import { BillEntryModalsComponent } from './modals/bill-entry-modals/bill-entry-modals.component';
import { EmployeedeductionmodalComponent } from './modals/employeedeductionmodal/employeedeductionmodal.component';
import { AddSuspensionmodalComponent } from './modals/add-suspensionmodal/add-suspensionmodal.component';
import { ExemptionentryComponent } from './modals/investment/exemptionentry/exemptionentry.component';
import { ProductYearlyTaxDetailsComponent } from './modals/product-yearly-tax-details/product-yearly-tax-details.component';
import { PreviewdocsModalComponent } from './modals/previewdocs-modal/previewdocs-modal.component';
import { ViewOnboardingProcessLogsComponent } from './modals/view-onboarding-process-logs/view-onboarding-process-logs.component';
import { DocumentviewermodalComponent } from './modals/documentviewermodal/documentviewermodal.component';
import { NoPanDeclarationModelComponent } from './modals/no-pan-declaration-model/no-pan-declaration-model.component';
import { UsersComponent } from './modals/users/users.component';
import { ResignationListDetailsComponent } from './modals/resignation-list-details/resignation-list-details.component';
import { ResignationApproveRejectModalComponent } from './modals/resignation-approve-reject-modal/resignation-approve-reject-modal.component';
import { UpdateInvestmentSubmissionSlotComponent } from './modals/update-investment-submission-slot/update-investment-submission-slot.component';
import { UpdateFbpSubmissionSlotComponent } from './modals/update-fbp-submission-slot-component/update-fbp-submission-slot-component';
import { AdditionalApplicableProductsComponent } from './modals/additional-applicable-products/additional-applicable-products.component';
import { UpdateShiftWeekOffComponentComponent } from './modals/attendance/update-shift-week-off-component/update-shift-week-off-component.component';
import { ViewEmployeeInSalaryCreditReportComponent } from './modals/view-employee-in-salary-credit-report/view-employee-in-salary-credit-report.component';
import { ApproveOrRejectTimesheetComponent } from './modals/approve-or-reject-timesheet/approve-or-reject-timesheet.component';
import { UpdateManagerMappingModalComponent } from './modals/update-manager-mapping-modal/update-manager-mapping-modal.component';
import { ProductCTCPayrollRuleMappingComponent } from './modals/product-ctcpayroll-rule-mapping/product-ctcpayroll-rule-mapping.component';
import { CountryModalComponent } from './modals/country-modal/country-modal.component';
import { StatuatoryModalComponent } from './modals/statuatory-modal/statuatory-modal.component';
import { NomineeModalComponent } from './modals/nominee-modal/nominee-modal.component';
import { WorkexperienceModalComponent } from './modals/workexperience-modal/workexperience-modal.component';
import { AcademicModalComponent } from './modals/academic-modal/academic-modal.component';
import { BankModalComponent } from './modals/bank-modal/bank-modal.component';
import { PreviewCtcModalComponent } from './modals/preview-ctc-modal/preview-ctc-modal.component';
import { ApprovalModalComponent } from './modals/approval-modal/approval-modal.component';
import { DocumentsModalComponent } from './modals/documents-modal/documents-modal.component';
import { TransactionsModalComponent } from './modals/transactions-modal/transactions-modal.component';
import { WorklocationModalComponent } from './modals/worklocation-modal/worklocation-modal.component';
import { CityModelComponent } from './modals/city-modal/city-model.component';
import { MinimumwagesModelComponent } from './modals/minimumwages-model/minimumwages-model.component';
import { ScaleModalComponent } from './modals/scale-modal/scale-modal.component';
import { PayrollImportdataComponent } from './modals/payroll/payroll-importdata/payroll-importdata.component';
import { DownloadBillingSheetModalComponent } from './modals/payroll/download-billing-sheet-modal/download-billing-sheet-modal.component';
import { ProductModalComponent } from './modals/product-modal/product-modal.component';
import { ProductDetailsComponent } from './modals/product-details/product-details.component';
import { SaleorderSummaryModalComponent } from './modals/payroll/saleorder-summary-modal/saleorder-summary-modal.component';
import { GenericFormUiModalComponent } from './modals/generic-form-modals/generic-form-ui-modal/generic-form-ui-modal.component';
import { HramodalComponent } from './modals/employee/hramodal/hramodal.component';
import { ConfigureModalComponent } from './modals/generic-form-modals/configure-modal/configure-modal.component';
import { ConfigureInputsModalComponent } from './modals/generic-form-modals/configure-inputs-modal/configure-inputs-modal.component';
import { ConfigureColumnModalComponent } from './modals/generic-form-modals/configure-column-modal/configure-column-modal.component';
import { CustomdrawerModalComponent } from './modals/investment/customdrawer-modal/customdrawer-modal.component';

import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { LoadingScreenService } from './components/loading-screen/loading-screen.service';
import { SuccessScreenComponent } from './components/success-screen/success-screen.component';
import { FiledownloadComponent } from './components/filedownload/filedownload.component';
import { AccessdeniedComponent } from './components/accessdenied/accessdenied.component';
import { S3UploadComponent } from './components/s3-upload/s3-upload.component';
import { ServicefeeComponent } from './components/clientContract/servicefee/servicefee.component';
import { IntegrumPaginationComponent } from './components/integrum-pagination/integrum-pagination.component';
import { BillingproductComponent } from './components/clientContract/billingproduct/billingproduct.component';
import { InvoicegroupComponent } from './components/clientContract/invoicegroup/invoicegroup.component';
import { AlertScreenComponent } from './components/alert-screen/alert-screen.component';
import { HelpComponent } from './components/help/help.component';
import { NewContractComponent } from 'src/app/shared/components/contract-new/contract-new.component';
import { FileDownloadNewComponent } from './components/file-download-new/file-download-new.component';
import { FileDownloadComponent } from '../components/shared/file-download/file-download.component';
import { LoaderComponent } from '../components/shared/loader/loader.component';
import { PageNotFoundComponent } from '../components/shared/page-not-found/page-not-found.component';
import { NgbdModalConfig } from '../components/shared/modal-config/modal-config';
import { InfoPopUpComponent } from './components/info-pop-up/info-pop-up.component';

import { InputrestrictionDirective } from './directives/inputrestriction.directive';
import { enumHelper } from './directives/_enumhelper';
import { NumberDirective } from './directives/numbers-only.directive';
import { ScrollSpyDirective } from './directives/scroll-spy.directive';
import { FileDragNDropDirective } from './directives/drag-drop.directive';

import { PhonePipe } from './pipes/PhonePipe';
import { KeysPipe } from './pipes/keypipe';
import { FilterCustomPipe } from './pipes/filterpipe';
import { CategoryPipe } from './pipes/CategoryPIpe';
import { ArraySortPipe } from './pipes/sortPipe';
import { StatuatoryRuleComponent } from './modals/statutory-rule/statuatory-rule.component';
import { ProductStatuatoryDetailsComponent } from './modals/product-statuatory-details/product-statuatory-details.component';
import { AdditionalAppProductsComponent } from './modals/additional-app-products/additional-app-products.component';
import { CommonFileUploaderComponent } from './components/common-file-uploader/common-file-uploader.component';
import { PreviewEditHtmlComponent } from './modals/preview-edit-html/preview-edit-html.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { RegularizeAttendanceModalComponent } from './modals/attendance/regularize-attendance-modal/regularize-attendance-modal.component';
import { ApproveRejectEmployeeRegularizationModalComponent } from './modals/attendance/approve-reject-employee-regularization-modal/approve-reject-employee-regularization-modal.component';
import { EmploymentReferenceDetailsComponent } from './modals/employment-reference-details/employment-reference-details.component';
import { ShiftWeekoffMappingByManagerComponent } from './modals/attendance/shift-weekoff-mapping-by-manager/shift-weekoff-mapping-by-manager.component';
import { NoDueCertificateComponent } from './modals/noDueCertificate-modal/noDueCertificate-modal.component';
import { TruncateTextDirective } from './directives/truncate-text.directive';
import { FormErrorModule } from './components/form-error-wrapper/form-error.module';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  key => antDesignIcons[key]
);
@NgModule({
  declarations: [
    ConfirmDialogComponent,
    StatesModalComponent,
    CountryModalComponent,
    StatuatoryModalComponent,
    StatuatoryRuleComponent,
    ProductStatuatoryDetailsComponent,
    AdditionalAppProductsComponent,
    InputrestrictionDirective,
    NomineeModalComponent,
    WorkexperienceModalComponent,
    AcademicModalComponent,
    BankModalComponent,
    LoadingScreenComponent,
    PreviewCtcModalComponent,
    PhonePipe,
    KeysPipe,
    CategoryPipe,
    ArraySortPipe,
    FilterCustomPipe,
    ApprovalModalComponent,
    SuccessScreenComponent,
    DocumentsModalComponent,
    FiledownloadComponent,
    TransactionsModalComponent,
    WorklocationModalComponent,
    CityModelComponent,
    AccessdeniedComponent,
    MinimumwagesModelComponent,
    ScaleModalComponent,
    PayrollImportdataComponent,
    DownloadBillingSheetModalComponent,
    ProductModalComponent,
    ProductDetailsComponent,
    SaleorderSummaryModalComponent,
    GenericFormUiModalComponent,
    HramodalComponent,
    ConfigureModalComponent,
    ConfigureInputsModalComponent,
    ConfigureColumnModalComponent,
    CustomdrawerModalComponent,
    ConfigureDataSourceModalComponent,
    ConfigureImportInputModalComponent,
    SaleorderModalComponent,
    AddemployeeModalComponent,
    PayoutFinanceModalComponent,
    PayoutViewrequestModalComponent,
    RemarksModalComponent,
    LossfromhousepropModalComponent,
    MedicdependentModalComponent,
    S3UploadComponent,
    InitiateSaleOrderModalComponent,
    AttendancelogModalComponent,
    ServicefeeComponent,
    IntegrumPaginationComponent,
    BillingproductComponent,
    InvoicegroupComponent,
    ConfirmationAlertModalComponent,
    PayrollhistorylogModalComponent,
    InvoiceModalComponent,
    AlertScreenComponent,
    HelpComponent,
    EmploymentcontractSeparationComponent,
    ElcApprovalModalComponent,
    PaymentstatusComponent,
    AttendanceRequestComponent,
    CustomActionFormatterComponent,
    LeaveregularizeComponent,
    ImagecaptureModalComponent,
    EmployeeleaverequestModalComponent,
    EmployeebulkattendanceModalComponent,
    CommunicationModalComponent,
    Genericimport2ModalComponent,
    WebviewModalComponent,
    RegularizeleaverequestModalComponent,
    AddexpenseModalComponent,
    ViewdocsModalComponent,
    ImageviewerComponent,
    NewContractComponent,
    MultiButtonWidgetComponent,
    BillEntryModalsComponent,
    EmployeedeductionmodalComponent,
    AddSuspensionmodalComponent,
    ExemptionentryComponent,
    ProductYearlyTaxDetailsComponent,
    PreviewdocsModalComponent,
    ViewOnboardingProcessLogsComponent,
    FileDownloadNewComponent,
    FileDownloadComponent,
    LoaderComponent,
    UpdateInvestmentSubmissionSlotComponent,
    PageNotFoundComponent,
    NgbdModalConfig,
    DocumentviewermodalComponent,
    NumberDirective, // directive to accept only numbers on input field
    NoPanDeclarationModelComponent, UsersComponent, NoDueCertificateComponent, ResignationListDetailsComponent, ResignationApproveRejectModalComponent,
    ScrollSpyDirective,
    FileDragNDropDirective,
    UpdateFbpSubmissionSlotComponent,
    AdditionalApplicableProductsComponent,
    UpdateShiftWeekOffComponentComponent,
    ViewEmployeeInSalaryCreditReportComponent,
    ApproveOrRejectTimesheetComponent,
    ProductCTCPayrollRuleMappingComponent,
    UpdateManagerMappingModalComponent,
    InfoPopUpComponent,
    CommonFileUploaderComponent,
    PreviewEditHtmlComponent,
    RegularizeAttendanceModalComponent,
    ApproveRejectEmployeeRegularizationModalComponent,
    EmploymentReferenceDetailsComponent,
    ShiftWeekoffMappingByManagerComponent,
    TruncateTextDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    NgSelectModule,
    NgbModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    NgxSpinnerModule,
    AngularSlickgridModule.forRoot({
      enableAutoResize: true,
    }),
    DragDropModule,
    NgZorroAntdModule.forRoot(),
    NzTableModule, Ng2SearchPipeModule,
    TooltipModule, NzPopconfirmModule, TextMaskModule, WebcamModule,
    MatTooltipModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCFNwiuRsaxnJrOSZVCVZMWuS9AZuDHHV0'
    }),
    AngularEditorModule,
    FormErrorModule
  ],
  entryComponents: [
    StatesModalComponent,
    CountryModalComponent,
    StatuatoryModalComponent,
    StatuatoryRuleComponent,
    ProductStatuatoryDetailsComponent,
    AdditionalAppProductsComponent,
    ConfirmDialogComponent,
    NomineeModalComponent,
    WorkexperienceModalComponent,
    AcademicModalComponent,
    BankModalComponent,
    PreviewCtcModalComponent,
    LoadingScreenComponent,
    ApprovalModalComponent,
    DocumentsModalComponent,
    FiledownloadComponent,
    TransactionsModalComponent,
    WorklocationModalComponent,
    CityModelComponent,
    MinimumwagesModelComponent,
    ScaleModalComponent,
    PayrollImportdataComponent, DownloadBillingSheetModalComponent,
    ProductModalComponent,
    ProductDetailsComponent,
    SaleorderSummaryModalComponent,
    HramodalComponent, CustomdrawerModalComponent,
    LossfromhousepropModalComponent,

    // Generic Form
    GenericFormUiModalComponent,
    ConfigureModalComponent,
    ConfigureInputsModalComponent,
    ConfigureColumnModalComponent,

    //Generic Import
    ConfigureDataSourceModalComponent,
    ConfigureImportInputModalComponent,
    SaleorderModalComponent,
    AddemployeeModalComponent,
    PayoutFinanceModalComponent,
    PayoutViewrequestModalComponent,
    MedicdependentModalComponent,
    InitiateSaleOrderModalComponent,
    RemarksModalComponent,
    AttendancelogModalComponent,
    ServicefeeComponent,
    IntegrumPaginationComponent,
    BillingproductComponent,
    InvoicegroupComponent,
    ConfirmationAlertModalComponent,
    PayrollhistorylogModalComponent,
    InvoiceModalComponent,
    AlertScreenComponent,
    PaymentstatusComponent,
    AttendanceRequestComponent,
    ElcApprovalModalComponent,
    CustomActionFormatterComponent,
    LeaveregularizeComponent,
    ImagecaptureModalComponent,
    EmployeeleaverequestModalComponent,
    EmployeebulkattendanceModalComponent,
    CommunicationModalComponent,
    Genericimport2ModalComponent,
    WebviewModalComponent,
    RegularizeleaverequestModalComponent,
    AddexpenseModalComponent,
    ViewdocsModalComponent,
    ImageviewerComponent,
    NewContractComponent,
    MultiButtonWidgetComponent,
    BillEntryModalsComponent,
    EmployeedeductionmodalComponent,
    ProductYearlyTaxDetailsComponent,
    PreviewdocsModalComponent,
    ViewOnboardingProcessLogsComponent,
    AddSuspensionmodalComponent,
    SuccessScreenComponent,
    FileDownloadComponent,
    LoaderComponent,
    DocumentviewermodalComponent,
    NoPanDeclarationModelComponent,
    UsersComponent,
    NoDueCertificateComponent,
    ResignationListDetailsComponent,
    ResignationApproveRejectModalComponent,
    UpdateFbpSubmissionSlotComponent,
    UpdateInvestmentSubmissionSlotComponent,
    AdditionalApplicableProductsComponent,
    UpdateShiftWeekOffComponentComponent,
    ViewEmployeeInSalaryCreditReportComponent,
    ApproveOrRejectTimesheetComponent,
    ProductCTCPayrollRuleMappingComponent,
    UpdateManagerMappingModalComponent,
    PreviewEditHtmlComponent,
    RegularizeAttendanceModalComponent,
    ApproveRejectEmployeeRegularizationModalComponent,
    EmploymentReferenceDetailsComponent,
    ShiftWeekoffMappingByManagerComponent
  ],
  exports: [
    GenericFormUiModalComponent,
    StatesModalComponent,
    CountryModalComponent,
    StatuatoryModalComponent,
    StatuatoryRuleComponent,
    ProductStatuatoryDetailsComponent,
    AdditionalAppProductsComponent,
    NomineeModalComponent,
    WorkexperienceModalComponent,
    AcademicModalComponent,
    BankModalComponent,
    PreviewCtcModalComponent,
    InputrestrictionDirective,
    MatButtonModule,
    MatDialogModule,
    LoadingScreenComponent,
    ApprovalModalComponent,
    DocumentsModalComponent,
    FiledownloadComponent,
    TransactionsModalComponent,
    WorklocationModalComponent,
    CityModelComponent,
    MinimumwagesModelComponent,
    ScaleModalComponent,
    PayrollImportdataComponent, DownloadBillingSheetModalComponent,
    ProductModalComponent,
    ProductDetailsComponent,
    SaleorderSummaryModalComponent,
    HramodalComponent,
    KeysPipe,
    CategoryPipe,
    ArraySortPipe,
    FilterCustomPipe,
    CustomdrawerModalComponent,
    NgZorroAntdModule,
    SaleorderModalComponent,
    AddemployeeModalComponent,
    PayoutFinanceModalComponent,
    PayoutViewrequestModalComponent,
    LossfromhousepropModalComponent,
    MedicdependentModalComponent,
    InitiateSaleOrderModalComponent,
    RemarksModalComponent,
    AttendancelogModalComponent,
    ServicefeeComponent,
    IntegrumPaginationComponent,
    BillingproductComponent,
    InvoicegroupComponent,
    ConfirmationAlertModalComponent,
    PayrollhistorylogModalComponent,
    InvoiceModalComponent,
    AlertScreenComponent,
    PaymentstatusComponent,
    AttendanceRequestComponent,
    CustomActionFormatterComponent,
    LeaveregularizeComponent,
    ImagecaptureModalComponent,
    EmployeeleaverequestModalComponent,
    EmployeebulkattendanceModalComponent,
    CommunicationModalComponent,
    Genericimport2ModalComponent,
    WebviewModalComponent,
    RegularizeleaverequestModalComponent,
    AddexpenseModalComponent,
    ViewdocsModalComponent,
    EmployeedeductionmodalComponent,
    UpdateInvestmentSubmissionSlotComponent,
    NumberDirective,
    FileDragNDropDirective,
    ImageviewerComponent,
    NewContractComponent,
    MultiButtonWidgetComponent,
    PreviewdocsModalComponent,
    AddSuspensionmodalComponent,
    SuccessScreenComponent,
    FileDownloadComponent,
    LoaderComponent,
    DocumentviewermodalComponent,
    NoPanDeclarationModelComponent,
    UsersComponent,
    NoDueCertificateComponent,
    ResignationListDetailsComponent,
    ResignationApproveRejectModalComponent,
    ScrollSpyDirective,
    UpdateFbpSubmissionSlotComponent,
    AdditionalApplicableProductsComponent,
    UpdateShiftWeekOffComponentComponent,
    ViewEmployeeInSalaryCreditReportComponent,
    ApproveOrRejectTimesheetComponent,
    ProductCTCPayrollRuleMappingComponent,
    UpdateManagerMappingModalComponent,
    InfoPopUpComponent,
    CommonFileUploaderComponent,
    PreviewEditHtmlComponent,
    RegularizeAttendanceModalComponent,
    ApproveRejectEmployeeRegularizationModalComponent,
    EmploymentReferenceDetailsComponent,
    ShiftWeekoffMappingByManagerComponent,
    TruncateTextDirective,
    FormErrorModule
  ],
  providers: [
    enumHelper,
    PhonePipe,
    CategoryPipe,
    ArraySortPipe,
    LoadingScreenService,
    { provide: NZ_I18N, useValue: en_US }, { provide: NZ_ICONS, useValue: icons }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]


})
export class SharedModule { }

















