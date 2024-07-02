import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { Column, GridOption, AngularGridInstance, FieldType, Filters, Formatters } from 'angular-slickgrid';
import { AlertService, ExcelService, SessionStorage } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SearchElement } from '../../personalised-display/models';
import { AttendanceService } from '@services/service/attendnace.service';
import * as XLSX from 'xlsx';
import { UtilityService } from '@services/service/utitlity.service';
import moment from 'moment';
import { environment } from 'src/environments/environment';

type AOA = any[][];

@Component({
  selector: 'app-bulk-upload-leave-attendance',
  templateUrl: './bulk-upload-leave-attendance.component.html',
  styleUrls: ['./bulk-upload-leave-attendance.component.css']
})
export class BulkUploadLeaveAttendanceComponent implements OnInit {

  @ViewChild("fileInput") inputFile: ElementRef;

  importDropdownList: any[] = [{
    Name: 'Leave',
    Code: "LeaveBulkImportTemplate"
  }, {
    Name: 'Attendance',
    Code: "AttendanceBulkImportTemplate"
  }, {
    Name: 'On Duty',
    Code: "ODBulkImportTemplate"
  }];
  selectedImportOption: string = null;
  disableImportDropdown: boolean = false;

  fullSpinner: boolean = false;
  spinner: boolean = false;
  finalResponse: any = null;
  file: File;
  uploaded: boolean = false;
  submitted: boolean = false;
  activeTabName: string;

  //For Search Bar
  searchElemetsList: SearchElement[];


  //Grid beforeUpload
  beforeUploadColumnDefinition: Column[];
  beforeUploadGridOptions: GridOption;
  beforeUploadDataset: any[];
  beforeUploadAngularGrid: AngularGridInstance;
  beforeUploadGridObj: any;
  beforeUploadDataviewObj: any;
  beforeUploadselectedItems: any[];

  apiResultDataset = [];

  //Session Details
  sessionDetails: LoginResponses;
  clientId: number;
  clientContractId: any;
  businessType: number;

  bulkUploadHasError: boolean = false;
  uploadedErrorMessage: any = '';
  deleteExistingPunches: boolean = false;
  leaveCodes = [];
  message = [];

  constructor(
    private alertService: AlertService,
    private loadingScreen: LoadingScreenService,
    private sessionService: SessionStorage,
    private excelService: ExcelService,
    private attendanceService: AttendanceService,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.clientId = this.businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ClientId'));
    this.clientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.fullSpinner = false;
  }

  onImportChange(evt) {
    this.beforeUploadDataset = [];
    this.uploadedErrorMessage = '';
    this.beforeUploadColumnDefinition = [];
    this.finalResponse = null;
    this.message = [];
    if (this.selectedImportOption == 'LeaveBulkImportTemplate') {
      this.loadingScreen.startLoading();
      this.leaveCodes = [];
      this.message = environment.environment.NotesForBulkUploadLeave ? environment.environment.NotesForBulkUploadLeave : [];
      this.attendanceService.getAllEntitlementsByClientId(this.clientId).subscribe(res => {
        this.loadingScreen.stopLoading();
        if (res.Status && res.Result && res.Result != '') {
          this.leaveCodes = JSON.parse(res.Result);
        }
      }, err => {
        this.loadingScreen.stopLoading();
        console.warn('error while calling getAllEntitlementsByClientId API', err);
      });
    }

    if (this.selectedImportOption == 'AttendanceBulkImportTemplate') {
      this.message = environment.environment.NotesForBulkUploadAttendance ? environment.environment.NotesForBulkUploadAttendance : [];
    }
    if (this.selectedImportOption == 'ODBulkImportTemplate') {
      this.message = environment.environment.NotesForBulkUploadOnDuty ? environment.environment.NotesForBulkUploadOnDuty : [];
    }
  }

  onChangeDeletePunches(evt) {
    if (evt.target.checked) {

      this.deleteExistingPunches = true;
    } else {

      this.deleteExistingPunches = false;
    }
    console.log(evt.target.checked);
  }

  onUploadButtonClicked() {
    console.log("clicked");
    this.file = null;
    this.inputFile.nativeElement.files = null;
    this.inputFile.nativeElement.value = '';
    this.uploaded = false;
  }

  handleFileInput(files: FileList) {
    this.file = files.item(0);

    if (!this.file) {
      this.alertService.showWarning("Please select a file to process");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        this.loadingScreen.startLoading();
        this.spinner = true;

        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellText: false, cellDates: true, dateNF: 'dd-mm-yyyy hh:mm:ss AM/PM' });

        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        let jsonData = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'dd-mm-yyyy hh:mm:ss AM/PM' });
        if (!jsonData || jsonData.length === 0) {
          this.resetValues();
          this.alertService.showWarning("There is no data available !");
        } else {
          const headers = this.getHeadersForUploadedFile(ws);
          const validateHeaders = this.validateHeadersForUploadedFile(headers);

          if (validateHeaders && validateHeaders.length > 0) {
            this.handleMissingHeaders(validateHeaders);
            this.resetValues();
          } else {
            this.setGridOptions();
            this.setColumnDefinition(jsonData);
            this.handleValidData(jsonData);
          }
        }
      } catch (ex) {
        console.log(ex);
        this.loadingScreen.stopLoading();
        this.spinner = false;
        this.alertService.showWarning("Error Occured while parsing excel");
      } finally {
        this.loadingScreen.stopLoading();
        this.spinner = false;
      }
    };
    reader.readAsBinaryString(this.file);
  }

  private resetValues() {
    this.uploaded = false;
    this.bulkUploadHasError = true;
    this.spinner = false;
    this.file = null;
    this.message = [];
    this.deleteExistingPunches = false;
    this.finalResponse = null;
    this.loadingScreen.stopLoading();
  }

  private handleMissingHeaders(validateHeaders: any[]) {
    this.beforeUploadDataset = [];
    this.bulkUploadHasError = true;
    this.uploadedErrorMessage = `${validateHeaders.toString()} is missing`;
  }

  private handleValidData(jsonData: any[]) {
    this.uploadedErrorMessage = '';
    const validateData = this.validateBulkUploadedData(jsonData);
    console.log(validateData);

    this.beforeUploadDataset = validateData.sort((a, b) => {
      if (a.Remarks !== "" && b.Remarks === "") {
        return -1;
      } else if (a.Remarks === "" && b.Remarks !== "") {
        return 1;
      } else {
        return 0;
      }
    });
    console.log(this.beforeUploadDataset);
    if (!this.bulkUploadHasError) {
      this.doTriggerValidateAPI();
    } else {
      this.resetValues();
    }
  }


  getHeadersForUploadedFile(worksheet: XLSX.WorkSheet): string[] {
    const headers: string[] = [];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const header = XLSX.utils.encode_col(C);
      const cell = worksheet[header + '1'];
      if (cell && cell.v) {
        headers.push(cell.v);
      }
    }

    return headers;
  }

  validateHeadersForUploadedFile(headers: any) {
    const leaveHeaders = ['EmployeeCode', 'LeaveCode', 'AppliedFrom', 'AppliedTill', 'AdditionalDate', 'FromSession', 'ToSession', 'Remarks'];
    const attendanceHeaders = ['EmployeeCode', 'LogTime', 'LogDate'];
    const onDutyHeaders = ['EmployeeCode', 'AppliedFrom', 'AppliedTill', 'FromSession', 'ToSession', 'Remarks'];

    let expectedHeaders = [];

    switch (this.selectedImportOption) {
      case 'LeaveBulkImportTemplate':
        expectedHeaders = leaveHeaders;
        break;
      case 'AttendanceBulkImportTemplate':
        expectedHeaders = attendanceHeaders;
        break;
      case 'ODBulkImportTemplate':
        expectedHeaders = onDutyHeaders;
        break;
      default:
        break;
    }
    const missingHeaders = expectedHeaders.filter(name => !headers.includes(name));
    return missingHeaders;
  }


  validateBulkUploadedData(data: any[]) {
    this.spinner = true;

    const validateDate = (dateStr, item) => {
      const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
      const date = moment(dateStr, 'DD-MM-YYYY hh:mm:ss A').format('DD-MM-YYYY');
      const match = date.match(dateRegex);

      if (!match) {
        item.ErrorRemarks = "Date format is not valid. Please enter the date in DD-MM-YYYY format.";
        this.bulkUploadHasError = true;
        return null;
      } else {
        const [_, day, month, year] = match.map(Number);
        const parsedDate = new Date(year, month - 1, day);

        if (month < 1 || month > 12 || day < 1 || day > 31 || isNaN(parsedDate.getTime())) {
          item.ErrorRemarks = "Invalid date. Please enter the date in DD-MM-YYYY format.";
          this.bulkUploadHasError = true;
        }

        return parsedDate;
      }
    };

    data.forEach((item, idx) => {
      item.Id = idx + 1;
      item.ErrorRemarks = "";
      this.bulkUploadHasError = false;

      if (this.selectedImportOption == 'LeaveBulkImportTemplate') {
        item.LeaveCode = item.LeaveCode.trim();
        // Find the leave object that matches the code
        const matchingLeave = this.leaveCodes.find(leave => leave.Code.toLowerCase()=== item.LeaveCode.toLowerCase());

        if (!matchingLeave) {
          item.ErrorRemarks = `Entered leave code "${item.LeaveCode}" is incorrect. The available leave codes are: ${this.getAvailableLeaveCodes()}`;
          this.bulkUploadHasError = true;
        }
      }

      if (this.selectedImportOption == 'AttendanceBulkImportTemplate') {
        item.LogDate = moment(item.LogDate, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD');
        // Original time string
        const timeString = item.LogTime;
        const dateTimeParts = timeString.split(' ');
        let timePart = dateTimeParts[1];
        const timeComponents = timePart.split(':');
        let hours = parseInt(timeComponents[0], 10);
        const minutes = timeComponents[1];
        const seconds = timeComponents[2];
        if (dateTimeParts[2] === 'PM' && hours !== 12) {
          hours += 12;
        }
        if (hours === 12 && dateTimeParts[2] === 'AM') {
          hours = 0;
        }
        timePart = `${hours}:${minutes}:${seconds}`;
        item.LogTime = timePart;
      }

      if (this.selectedImportOption !== 'AttendanceBulkImportTemplate') {
        const fromDate = validateDate(item.AppliedFrom, item);
        const toDate = validateDate(item.AppliedTill, item);
        if (item.AdditionalDate) {
          validateDate(item.AdditionalDate, item)
        }

        item.FromSession = item.FromSession ? Number( item.FromSession) : 0;
        item.ToSession = item.ToSession ? Number(item.ToSession) : 0;

        if (!this.bulkUploadHasError && fromDate && toDate) {
          const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
          const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
          const currentDate = new Date();
          const numberPattern = /^[012]+$/;

          from.setUTCHours(0, 0, 0, 0);
          to.setUTCHours(0, 0, 0, 0);
          currentDate.setUTCHours(0, 0, 0, 0);

          if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            item.ErrorRemarks = "Date format is not valid. Please enter the date in DD-MM-YYYY format.";
            this.bulkUploadHasError = true;
          } else if (fromDate > toDate) {
            const formattedDate = this.utilityService.formatDate(fromDate, 'DD-MM-YYYY');
            item.ErrorRemarks = `Effective To should be same or greater than ${formattedDate}. Please ensure the date format is DD-MM-YYYY.`;
            this.bulkUploadHasError = true;
          } else {
            item.AppliedFrom = moment(item.AppliedFrom, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD');
            item.AppliedTill = moment(item.AppliedTill, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD');
            item.AdditionalDate = item.AdditionalDate ? moment(item.AdditionalDate, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD') : ""
          }

          if (!numberPattern.test(item.ToSession)) {
            this.bulkUploadHasError = true;
            item.ErrorRemarks = item.ErrorRemarks + "The 'tosession' value must be either 1 (for the first half), or 2 (for the second half). Please ensure you enter one of these options.If you are applying for full day please dont enter values in fromsession and tosession";
          }
          
          if (!numberPattern.test(item.FromSession)) {
            this.bulkUploadHasError = true;
            item.ErrorRemarks = item.ErrorRemarks + "The 'fromsession' value must be either 1 (for the first half), or 2 (for the second half). Please ensure you enter one of these options.If you are applying for full day please dont enter values in fromsession and tosession";
          }
          if (fromDate.getTime() === toDate.getTime() && item.FromSession !== item.ToSession) {
            this.bulkUploadHasError = true;
            item.ErrorRemarks = "The fromsession and tosession cannot have different value for same date. If you are applying for full day please dont enter values in fromsession and tosession";
          }
        }
      }
    });
    return data;
  }

  getAvailableLeaveCodes(): string {
    return this.leaveCodes.map(leave => leave.Code).join(', ');
  }

  private getUniqueKeys(data) {
    const keysSet = new Set();
    data.forEach(obj => {
      Object.keys(obj).forEach(key => keysSet.add(key));
    });
    return Array.from(keysSet);
  }

  setColumnDefinition(data) {
    if (data && data.length) {
      // Extract keys from the object with the maximum keys
      const keys = this.getUniqueKeys(data);

      const columnDefinition: Column[] = keys.map(key => ({
        id: key,
        name: key,
        field: key,
        sortable: true,
        filterable: true
      })) as any;

      // Add Remarks column to show error
      columnDefinition.push({
        id: 'ErrorRemarks',
        name: 'Error Remarks',
        field: 'ErrorRemarks',
        sortable: true,
        filterable: true,
        type: FieldType.string
      });
      columnDefinition.forEach(el => {
        if (el.id == 'AppliedFrom' || el.id == 'AdditionalDate' || el.id == 'LogDate' || el.id == 'AttendanceDate' || el.id == 'AppliedTill') {
          el.formatter = this.DateFormatter,
          el.type = FieldType.string
        }
      });
      console.log(columnDefinition);
      this.beforeUploadColumnDefinition = columnDefinition;
    }
  }

  setGridOptions() {
    this.beforeUploadGridOptions = {
      asyncEditorLoading: false,
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      forceFitColumns: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      leaveSpaceForNewRows: true,
      enableFiltering: true,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
      checkboxSelector: {
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id",
      enableAutoTooltip: true,
    }
  }

  onClickingSubmitExcelButton() {
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
      confirmButtonText: 'Yes, Save!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.insertBulkData();
      } else if (result.dismiss === Swal.DismissReason.cancel) { }
    })
  }

  doTriggerValidateAPI() {
    this.loadingScreen.startLoading();
    if (this.selectedImportOption == 'LeaveBulkImportTemplate') {
      const data = [];
      this.beforeUploadDataset.forEach(a => {
        const tempObj = {
          EmployeeCode: a.EmployeeCode,
          LeaveCode: a.LeaveCode,
          AppliedFrom: a.AppliedFrom,
          AppliedTill: a.AppliedTill,
          FromSession: Number(a.FromSession),
          ToSession: Number(a.ToSession),
          AdditionalDate: a.AdditionalDate ? a.AdditionalDate : "0001-01-01T00:00:00",
          Remarks: a.Remarks ? a.Remarks : ''
        }
        data.push(tempObj);
      });
      console.log('data', data);
      this.attendanceService.validateBulkLeaveTransaction(data).subscribe(res => {
        this.uploaded = true;
        this.apiResultDataset = [];
        this.loadingScreen.stopLoading();
        if (res.Status && res.Result && res.Result != '') {
          const response = JSON.parse(res.Result);
          this.apiResultDataset = response;
          let result = [];
          response.forEach((a, index) => {
            const tempObj = {
              Id: index + 1,
              EmployeeCode: a.EmployeeCode,
              LeaveCode: a.LeaveCode,
              AppliedFrom: a.AppliedFrom,
              AppliedTill: a.AppliedTill,
              FromSession: a.FromSession,
              ToSession: a.ToSession,
              Remarks: a.Remarks,
              AdditionalDate: a.AdditionalDate,
              ErrorRemarks: a.ErrorRemarks
            };
            result.push(tempObj);
          });
          this.beforeUploadDataset = result;
          this.beforeUploadGridObj.invalidate();
          this.beforeUploadGridObj.render();
          this.bulkUploadHasError = this.beforeUploadDataset.every(obj => obj.ErrorRemarks == "") ? false : true;
          console.log('VALIDATE RES', this.bulkUploadHasError, JSON.parse(res.Result));
        } else {
          this.uploaded = false;
          this.bulkUploadHasError = true;
          this.alertService.showWarning(res.Message);
        }
      }, err => {
        this.resetValues();
        console.log('error while calling validateBulkLeaveTransaction API', err);
      });
    }

    if (this.selectedImportOption == 'AttendanceBulkImportTemplate') {
      this.spinner = true;
      const excelData = [];
      this.beforeUploadDataset.forEach(a => {
        const date = moment(a.LogDate).format("DD-MM-YYYY");
        const time = `${a.LogTime}`;
        const logTime = moment(`${date} ${time}`, 'DD-MM-YYYY HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        const tempObj = {
          EmployeeCode: a.EmployeeCode,
          LogTime: logTime,
          LocationCode: "Default Device (HR)",
          DeviceId: "0"
        }
        excelData.push(tempObj);
      });
      const data = {
        ClientId: this.clientId,
        ClientContractId: this.clientContractId,
        Data: excelData
      }
      console.log('data', data);
      this.attendanceService.validateBiometricData(data).subscribe(res => {
        this.apiResultDataset = [];
        this.uploaded = true;
        this.loadingScreen.stopLoading();
        if (res.Status && res.Result && res.Result != '') {
          const response = JSON.parse(res.Result);
          this.apiResultDataset = response;
          let result = [];
          response.forEach((item, index) => {
            const tempObj = {
              Id: index + 1,
              EmployeeCode: item.EmployeeCode,
              LogDate: item.LogTime.split('T')[0],
              LogTime: item.LogTime.split('T')[1],
              ErrorRemarks: item.ErrorRemarks
            }
            result.push(tempObj);
          });
          this.beforeUploadDataset = result;
          this.beforeUploadGridObj.invalidate();
          this.beforeUploadGridObj.render();
          this.bulkUploadHasError = response.every(obj => obj.IsValid === true && obj.ErrorRemarks == "") ? false : true;
          console.log('VALIDATE RES', response, this.bulkUploadHasError);
        } else {
          this.uploaded = false;
          this.bulkUploadHasError = true;
          this.alertService.showWarning(res.Message);
        }
      }, err => {
        this.resetValues();
        console.log('error while calling validateBiometricData API', err);
      });
    }

    if (this.selectedImportOption == 'ODBulkImportTemplate') {
      const data = [];
      this.beforeUploadDataset.forEach(a => {
        const tempObj = {
          EmployeeCode: a.EmployeeCode,
          AppliedFrom: a.AppliedFrom,
          AppliedTill: a.AppliedTill,
          FromSession: a.FromSession ? Number(a.FromSession) : 0,
          ToSession: a.ToSession ? Number(a.ToSession) : 0,
          Remarks: a.Remarks ? a.Remarks : ''
        }
        data.push(tempObj);
      });
      console.log('data', data);
      this.attendanceService.validateOnDutyData(data).subscribe(res => {
        this.apiResultDataset = [];
        this.uploaded = true;
        this.loadingScreen.stopLoading();
        if (res.Status && res.Result && res.Result != '') {
          const response = JSON.parse(res.Result);
          this.apiResultDataset = response;
          let result = [];
          response.forEach((a, index) => {
            const tempObj = {
              Id: index + 1,
              id: index + 1,
              EmployeeCode: a.EmployeeCode,
              AppliedFrom: a.AppliedFrom,
              AppliedTill: a.AppliedTill,
              FromSession: a.FromSession,
              ToSession: a.ToSession,
              Remarks: a.Remarks,
              ErrorRemarks: a.ErrorRemarks
            };
            result.push(tempObj);
          });
          this.beforeUploadDataset = result;
          this.beforeUploadGridObj.invalidate();
          this.beforeUploadGridObj.render();
          this.bulkUploadHasError = response.every(obj => obj.ErrorRemarks == "") ? false : true;
          console.log('VALIDATE RES', JSON.parse(res.Result));
        } else {
          this.uploaded = false;
          this.bulkUploadHasError = true;
          this.alertService.showWarning(res.Message);
        }
      }, err => {
        this.resetValues();
        this.loadingScreen.stopLoading();
        console.log('error while calling validateOnDutyData API', err);
      });
    }
  }

  insertBulkData() {
    this.spinner = true;
    this.loadingScreen.startLoading();

    switch (this.selectedImportOption) {
      case 'LeaveBulkImportTemplate':
        this.insertBulkLeaveTransaction();
        break;
      case 'AttendanceBulkImportTemplate':
        this.insertBulkBiometricData();
        break;
      case 'ODBulkImportTemplate':
        this.insertBulkOnDutyData();
        break;
      default:
        console.log('Invalid import option');
    }
  }

  insertBulkLeaveTransaction() {
    const data = this.apiResultDataset;
    this.attendanceService.insertBulkLeaveTransaction(data).subscribe(
      res => {
        this.handleResponse(res, 'leave');
      },
      err => {
        this.handleError(err, 'leave');
      }
    );
  }

  insertBulkBiometricData() {
    const data = {
      ClientId: this.clientId,
      ClientContractId: this.clientContractId,
      DeleteOld: this.deleteExistingPunches,
      Data: this.apiResultDataset
    };
    this.attendanceService.insertBulkBiometricData(data).subscribe(
      res => {
        this.handleResponse(res, 'biometric');
      },
      err => {
        this.handleError(err, 'biometric');
      }
    );
  }

  insertBulkOnDutyData() {
    const data = this.apiResultDataset;
    this.attendanceService.insertBulkOnDutyData(data).subscribe(
      res => {
        this.handleResponse(res, 'onDuty');
      },
      err => {
        this.handleError(err, 'onDuty');
      }
    );
  }

  handleResponse(res: any, dataType: string) {
    console.log('VALIDATE RES', res);
    switch (dataType) {
      case 'leave':
        this.beforeUploadDataset = [];
        res.Status ? this.alertService.showSuccess('Successfully uploaded') : this.alertService.showWarning(res.Message);
        this.resetValues();
        break;
      case 'biometric':
        this.finalResponse = res.Status && res.Result && res.Result !== '' ? res.Result : null;
        res.Status ? this.alertService.showSuccess('Successfully uploaded') : this.alertService.showWarning(res.Message);
        this.resetValues();
        break;
      case 'onDuty':
        res.Status ? this.alertService.showSuccess('Successfully uploaded') : this.alertService.showWarning(res.Message);
        this.resetValues();
        break;
      default:
        console.log('Invalid data type');
    }
  }

  handleError(err: any, dataType: string) {
    console.log(`Error while calling API for ${dataType}:`, err);
    this.loadingScreen.stopLoading();
  }

  onbeforeUploadSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.beforeUploadDataset);

    this.beforeUploadselectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.beforeUploadDataviewObj.getItem(row);
        this.beforeUploadselectedItems.push(row_data);
      }
    }
    console.log('answer', this.beforeUploadselectedItems);
  }

  angularBeforeUploadGridReady(angularGrid: AngularGridInstance) {
    this.beforeUploadAngularGrid = angularGrid;
    this.beforeUploadGridObj = angularGrid.slickGrid;
    this.beforeUploadDataviewObj = angularGrid.dataView;
  }


  beforeTabChange(event) {

  }

  download_template() {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = `assets/file/${this.selectedImportOption}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
  }
}
