import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from '@services/service/attendnace.service';
import moment from 'moment';
import { forkJoin } from 'rxjs';

import { AlertService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';

@Component({
  selector: 'app-shift-weekoff-mapping-by-manager',
  templateUrl: './shift-weekoff-mapping-by-manager.component.html',
  styleUrls: ['./shift-weekoff-mapping-by-manager.component.css']
})
export class ShiftWeekoffMappingByManagerComponent implements OnInit {

  @Input() data: any;
  @Input() searchData: any;
  @Input() title: string;

  shiftWeekOffForm: FormGroup;
  isLoading: boolean = false;

  userId: any;
  roleId: any;
  clientId: string;

  minDate: any;
  effectiveToMinDate: Date;
  employeeList: any[] = [];
  shiftWeekOffList: any[] = [];

  isMultipleSelectionAllowedForShiftWeekOff: boolean = false;

  weekList = [{
    Code : 'SATURDAY',
    Name: 'SATURDAY'
  }, {
    Code : 'SUNDAY',
    Name: 'SUNDAY'
  }, {
    Code : 'MONDAY',
    Name: 'MONDAY'
  }, {
    Code : 'TUESDAY',
    Name: 'TUESDAY'
  }, {
    Code : 'WEDNESDAY',
    Name: 'WEDNESDAY'
  }, {
    Code : 'THURSDAY',
    Name: 'THURSDAY'
  }, {
    Code : 'FRIDAY',
    Name: 'FRIDAY'
  }];

  shiftWeekValidatedData: any[] = [];

  constructor(
    private datePipe: DatePipe,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    public pageLayoutService: PagelayoutService,
    private attendanceService: AttendanceService,
    private loadingScreen: LoadingScreenService
  ) {
    this.generateFrom();
  }

  get g() { return this.shiftWeekOffForm.controls; }

  ngOnInit() {
    this.isLoading = true;
    console.log('-- data --', this.data, this.searchData);
    const { '@userId': userId, '@roleId': roleId, '@clientId': clientId } = this.searchData.reduce((obj, item) => ({...obj, [item.FieldName]: item.Value }), {});
    this.userId = userId;
    this.roleId = roleId;
    this.clientId = clientId;
    this.isMultipleSelectionAllowedForShiftWeekOff = false;

    if (this.title == 'Week Off') {
      this.shiftWeekOffList = [...this.weekList];
      this.isMultipleSelectionAllowedForShiftWeekOff = true;
      this.getDirectReportingEmployees();
    } else {
      forkJoin([
        this.getDirectReportingEmployees(),
        this.loadShifts()
      ]).subscribe(value => {
        console.log('FORK JOIN OUTPUT :: ', value);
      });
    }
  }

  getDirectReportingEmployees() {
    let datasource: DataSource = {
      Name: "GetDirectReportingEmployee",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [
      {
        FieldName: "@userId",
        Value: this.userId
      },
      {
        FieldName: "@roleId",
        Value: this.roleId
      },
      {
        FieldName: "@clientId",
        Value: this.clientId
      }
    ];

    console.log(searchElements);
    this.employeeList = [];
    const allAttribute = [{
      Id:0,
      Code: 0,
      Name: 'All',
      LabelName: 'All'
    }];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      this.isLoading = false;
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('apiResult', apiResult);
        apiResult.map(element => {
          element.LabelName = `${element.Name} (${element.Code})`;
        });
        this.employeeList = apiResult;
        this.employeeList = allAttribute.concat(this.employeeList);
      }
    });
  }

  loadShifts() {
    this.isLoading = true;
    this.attendanceService.GetWorkShiftDefinitionsForAClient(this.clientId).subscribe((result) => {
      this.shiftWeekOffList = [];
      this.isLoading = false;
      if (result.Status && result.Result != '') {
        result.Result.map(e => {
          const startTime = moment(e.StartTime, 'HH:mm:ss').toDate();
          const endTime = moment(e.EndTime, 'HH:mm:ss').toDate(); // new Date(e.EndTime);
          e.formattedStartTime = moment(startTime).format('h:mm a');
          e.formattedEndTime = moment(endTime).format('h:mm a');
        });
        
        this.shiftWeekOffList = result.Result;
      }
    }, err => {
      console.log('ERROR IN API : GetWorkShiftDefinitionsForAClient', err);
    });
  }

  generateFrom() {
    const today = new Date();
    const tmrw = new Date(today);
    const tmrwTimeStamp = tmrw.setDate(tmrw.getDate() + 1);
    this.minDate = new Date(tmrwTimeStamp);

    this.shiftWeekOffForm = this.formBuilder.group({
      EmployeeCode: ['', Validators.required],
      ShiftWeekOffCode: [null, Validators.required],
      EffectiveFrom: [null, Validators.required],
      EffectiveTo: [this.minDate, Validators.required]
      
    });
  }

  onChangeEmpDropdown(e) {

  }

  onChangeShiftWoDropdown(e) {

  }

  doSave() {
    this.loadingScreen.startLoading();
    const formData = [];
    const formValues = this.shiftWeekOffForm.value;
    const empCodes = formValues.EmployeeCode;
    const filteredEmpCodes = this.employeeList.filter(item => item.Code != 0);
    const selectedEmpCodes = empCodes.filter(code => code != 0);
    formValues.IsValid = true;
    formValues.ErrorMessage = '';

    if (this.title == 'Week Off') {
      const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
      formValues.Day_Name = formValues.ShiftWeekOffCode.toString();
      const selectedWeekOffs = formValues.ShiftWeekOffCode;
      daysOfWeek.forEach(day => {
        formValues[day.charAt(0) + day.slice(1).toLowerCase()] = selectedWeekOffs.includes(day);
      });
    
      console.log('formmmm', formValues);
      selectedEmpCodes.forEach(empCode => {
        let duplicateQ = Object.assign({}, formValues);
        delete duplicateQ['ShiftWeekOffCode']; // delete keys not required for API 
        duplicateQ.EmployeeCode = empCode;
        duplicateQ.EffectiveFrom = this.datePipe.transform(formValues.EffectiveFrom, 'MM-dd-yyyy'),
        duplicateQ.EffectiveTo = this.datePipe.transform(formValues.EffectiveTo, 'MM-dd-yyyy')
        formData.push(duplicateQ);
      });
  
      // if all is chosen, then add all emp codes
      if (empCodes.includes(0)) {
        filteredEmpCodes.forEach(emp => {
          let duplicateQ = Object.assign({}, formValues);
          delete duplicateQ['ShiftWeekOffCode']; // delete keys not required for API 
          duplicateQ.EmployeeCode = emp.Code;
          duplicateQ.EffectiveFrom = this.datePipe.transform(formValues.EffectiveFrom, 'MM-dd-yyyy'),
          duplicateQ.EffectiveTo = this.datePipe.transform(formValues.EffectiveTo, 'MM-dd-yyyy')
          formData.push(duplicateQ);
        });
      }
    } else {
      selectedEmpCodes.forEach(empCode => {
        const temp = {
          EmployeeCode: empCode,
          ShiftCode: formValues.ShiftWeekOffCode,
          EffectiveFrom: this.datePipe.transform(formValues.EffectiveFrom, 'MM-dd-yyyy'),
          EffectiveTo: this.datePipe.transform(formValues.EffectiveTo, 'MM-dd-yyyy')
        };
        formData.push(temp);
      });
  
      // if all is chosen, then add all emp codes
      if (empCodes.includes(0)) {
        filteredEmpCodes.forEach(emp => {
          const temp = {
            EmployeeCode: emp.Code,
            ShiftCode: formValues.ShiftWeekOffCode,
            EffectiveFrom: this.datePipe.transform(formValues.EffectiveFrom, 'MM-dd-yyyy'),
            EffectiveTo: this.datePipe.transform(formValues.EffectiveTo, 'MM-dd-yyyy')
          };
          formData.push(temp);
        });
      }
    }

    let datasource: DataSource = {
      Name: this.title == 'Week Off' ? "MapWeekOffForEmployees" : "MapShiftForEmployees",
      Type: DataSourceType.SP,
      IsCoreEntity: false,
      EntityType: 120, // staging DB
    };

    let saveSearchElements: SearchElement[] = [
      {
        FieldName: "@clientId",
        Value: this.clientId
      },
      {
        FieldName: "@data",
        Value: JSON.stringify(formData)
      },
      {
        FieldName: "@isDataToBeValidated",
        Value: 0
      },
      {
        FieldName: "@userId",
        Value: this.userId
      },
      {
        FieldName: "@roleId",
        Value: this.roleId
      }
    ];
    console.log('OBJJJ', formData);
    // return;
    if (this.title == 'Week Off') {
      this.doSubmitWeekOffData(formData, true);
    }

    if (this.title == 'Shift') {
      this.doSubmitShiftData(formData, true);
    }
    // this.pageLayoutService.getDataset(datasource, saveSearchElements).subscribe((result) => {
    //   console.log('<--- MAP SHIFT --->', result);
    //   this.loadingScreen.stopLoading();
    //   if (result.Status && result.dynamicObject != null) {
    //     this.alertService.showSuccess('Data uploaded successfully !');
    //     this.doCloseModal();
    //   } else {
    //     result.Status ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
    //     this.doCloseModal();
    //   }
    // });
  }

  doSubmitWeekOffData(formData, isDataToBeValidated) {
    const data = {
      ClientId: Number(this.clientId),
      UserId: Number(this.userId),
      RoleId : Number(this.roleId),
      IsDataToBeValidated : isDataToBeValidated,
      Data: JSON.stringify(formData)
    };
    this.attendanceService.MapWeekOffForEmployees(JSON.stringify(data)).subscribe((result1) => {
      console.log('<--- MAP SHIFT --->', result1);
      this.shiftWeekValidatedData = [];
      this.loadingScreen.stopLoading();
      if (result1.Status && result1.Result != null && result1.Result != '' && result1.Result != undefined) {
        const parsedResponse = JSON.parse(result1.Result);
        // sort to show data with error first
        this.shiftWeekValidatedData = parsedResponse.sort((a, b) => a.IsValid - b.IsValid);
        console.log('parsedResponse', this.shiftWeekValidatedData);
        isDataToBeValidated = this.shiftWeekValidatedData.every(obj => obj.IsValid === true) ? false : true;
        // if data is valid, then process the bulk uploaded data
        if (!isDataToBeValidated) {
          this.shiftWeekValidatedData = [];
          this.doSubmitWeekOffData(parsedResponse, false);
        }
      } else if (result1.Status && result1.Result != null && result1.Result == '' && result1.Result != undefined) {
        this.alertService.showSuccess('Data uploaded successfully !');
        this.doCloseModal();
      } else {
        this.alertService.showWarning(result1.Message);
      }
    });
  }

  doSubmitShiftData(formData, isDataToBeValidated) {
    // since doing from direct selection pass isDataToBeValidated as false
    const data = {
      ClientId: Number(this.clientId),
      UserId: Number(this.userId),
      RoleId : Number(this.roleId),
      IsDataToBeValidated : isDataToBeValidated,
      Data: JSON.stringify(formData)
    };
    this.attendanceService.MapShiftForEmployees(JSON.stringify(data)).subscribe((result) => {
      console.log('<--- MAP SHIFT --->', result);
      this.shiftWeekValidatedData = [];
      this.loadingScreen.stopLoading();
      if (result.Status && result.Result != null && result.Result != '' && result.Result != undefined) {
        const parsedResponse = JSON.parse(result.Result);
        // sort to show data with error first
        this.shiftWeekValidatedData = parsedResponse.sort((a, b) => a.IsValid - b.IsValid);
        console.log('parsedResponse', this.shiftWeekValidatedData);
        isDataToBeValidated = this.shiftWeekValidatedData.every(obj => obj.IsValid === true) ? false : true;
        // if data is valid, then process the bulk uploaded data
        if (!isDataToBeValidated) {
          this.shiftWeekValidatedData = [];
          this.doSubmitShiftData(parsedResponse, false);
        }
      } else if (result.Status && result.Result != null && result.Result == '' && result.Result != undefined) {
        this.alertService.showSuccess('Data uploaded successfully !');
        this.doCloseModal();
      } else {
        this.alertService.showWarning(result.Message);
      }
    });
  }

  onChangeEffectiveFromDate(e) {
    if(e) {
      this.effectiveToMinDate = new Date(e);
      this.shiftWeekOffForm.controls['EffectiveTo'].setValue(this.effectiveToMinDate);
    }
  }

  onChangeEffectiveToDate(e) {
    
  }

  doCloseModal() {
    this.activeModal.close('Modal Closed');
  }

}
