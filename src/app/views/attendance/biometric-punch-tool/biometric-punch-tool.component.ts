import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientContract } from '@services/model/Client/ClientContract';
import { AttendanceService } from '@services/service/attendnace.service';
import moment from 'moment';

import { AlertService, EmployeeService, SessionStorage } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

@Component({
  selector: 'app-biometric-punch-tool',
  templateUrl: './biometric-punch-tool.component.html',
  styleUrls: ['./biometric-punch-tool.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BiometricPunchToolComponent implements OnInit {
  spinner: boolean = false;
  punchToolForm: FormGroup;
  deviceData = [];
  locationData = [];
  employeeList: any[] = [];
  clientId: any;
  clientContractId: any;
  employeeLstBuffer = [];
  bufferSize: number = 50;
  numberOfItemsFromEndBeforeFetchingMore: number = 10;
  loadEmpLoader: boolean = false;
  deleteOldPunches: boolean = false;
  showSuccessData: boolean = false;
  
  existingPuncheDetails = [];
  savedBiometricData = [];
  addedPuncheDetails: any = [];

  hours = Array.from({ length: 24 }, (_, i) => ({ Id: i.toString().padStart(2, '0'), Name: i })); // Array of hours from 0 to 23
  minutes = Array.from({ length: 60 }, (_, i) => ({ Id: i.toString().padStart(2, '0'), Name: i })); // Array of minutes from 0 to 59

  minDate: Date;
  maxDate: Date;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private loadingScreen: LoadingScreenService
  ) {
    this.createForm()
  }

  get g() { return this.punchToolForm.controls; }

  createForm() {
    this.punchToolForm = this.formBuilder.group({
      EmployeeCode: [null, Validators.required],
      Date: [null, Validators.required],
      selectedHour: [null, Validators.required],
      selectedMinute: [null, Validators.required],
      // LocationId: [null, Validators.required],
      DeviceId: [{ value: '', disabled: true }, Validators.required]

    });
  }

  ngOnInit() {
    this.loadingScreen.startLoading();
    const currentDate = new Date();
    // Set min date to the start of the current year
    this.minDate = new Date(currentDate.getFullYear(), 0, 1);
    this.maxDate = new Date(currentDate);
    this.maxDate.setDate(currentDate.getDate() - 1);

    this.clientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.clientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.employeeService.getApplicableEmployeeDetails(this.clientId).subscribe((result) => {
      // console.log('test', result);
      this.employeeList = [];
      if (result.Status && result.Result && result.Result != '') {
        this.employeeList = JSON.parse(result.Result);
        this.employeeList.map(element => {
          element.LabelName = `${element.Name} (${element.Code})`;
        });
      }
    }, err => {
      this.loadingScreen.stopLoading();
      console.log('ERROR IN getApplicableEmployeeDetails API -->', err);
    })

    this.attendanceService.getBiometricDeviceDetails(this.clientId).subscribe((result) => {
      // console.log('test', result);
      this.deviceData = [];
      this.loadingScreen.stopLoading();
      if (result.Status && result.Result && result.Result !== '') {
        this.deviceData = JSON.parse(result.Result);
        this.setDefaultDeviceId();
      }
    }, err => {
      this.loadingScreen.stopLoading();
      console.log('ERROR IN getBiometricDeviceDetails API -->', err);
    })
  }

  onScrollToEnd() {
    this.fetchMore();
  }

  onScroll({ end }) {
    if (this.loadEmpLoader || this.employeeList.length <= this.employeeLstBuffer.length) {
      return;
    }

    if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.employeeLstBuffer.length) {
      this.fetchMore();
    }
  }

  private fetchMore() {
    const len = this.employeeLstBuffer.length;
    const more = this.employeeList.slice(len, this.bufferSize + len);
    this.loadEmpLoader = true;
    // using timeout here to simulate backend API delay
    setTimeout(() => {
      this.loadEmpLoader = false;
      this.employeeLstBuffer = this.employeeLstBuffer.concat(more);
    }, 200)
  }

  onChangeDate(e) {

  }

  onChangeEmpDropdown(e) {

  }

  loadLocationData(employeeId) {
    this.locationData = [];
    this.loadingScreen.startLoading();
    this.attendanceService.getClientLocationByEmployeeId(employeeId).subscribe((response) => {
      this.loadingScreen.stopLoading();
      if (response.Status && response.Result != null && response.Result != "") {
        const parsedResult = JSON.parse(response.Result);
        this.locationData = [...parsedResult];
      } else {
        console.error('ERROR IN getClientLocationByEmployeeId API -->', response);
      }
    }, err => {
      this.loadingScreen.stopLoading();
      console.error('ERROR IN getClientLocationByEmployeeId API -->', err);
    });
  }

  onClickShowPunches() {
    this.showSuccessData = false;
    this.savedBiometricData = [];
    if (this.punchToolForm.get('EmployeeCode').value && this.punchToolForm.get('Date').value) {
      this.spinner = true;
      this.loadingScreen.startLoading();
      const formValue = this.punchToolForm.get('EmployeeCode').value;
      const result = this.employeeList.find(item => item.Id === formValue);
      const punchData = {
        ClientId: this.clientId,
        ClientContractId: this.clientContractId,
        EmployeeCode: result.Code,
        AttendanceDate: moment(this.punchToolForm.get('Date').value).format('YYYY-MM-DD')
      };
      console.log('punchDataPayload', punchData);
      this.existingPuncheDetails = [];
      this.attendanceService.existingPunchDetails(punchData).subscribe((response) => {
        this.loadingScreen.stopLoading();
        this.spinner = false;
        if (response.Status && response.Result != null && response.Result != "") {
          const parsedResult = JSON.parse(response.Result);
          this.existingPuncheDetails = this.sortExistingPunchData(parsedResult);
          console.log('punch-Res', this.existingPuncheDetails);
        } else {
          this.alertService.showWarning(response.Message);
          console.error('ERROR IN GetExistingPunchDetails API -->', response);
        }
      }, err => {
        this.loadingScreen.stopLoading();
        console.error('ERROR IN GetExistingPunchDetails API -->', err);
      });
    } else {
      this.alertService.showWarning('Please enter Employee Code and/ or Date');
    }
  }

  sortExistingPunchData(data): any[] {
    const sortedData = data.flatMap(item => {
      const startTimeObj = { id: item.Id, time: item.StartTime };
      const finishTimeObj = item.FinishTime ? { id: item.Id, time: item.FinishTime } : null;
      return [startTimeObj, finishTimeObj];
    }).filter(Boolean)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
    // Assign unique IDs to each entry
    const formattedData = sortedData.map((item, index) => ({ id: index + 1, time: item.time }));
  
    return formattedData;
  }

  onClickAdd() {
    this.showSuccessData = false;
    this.savedBiometricData = [];
    if (!this.punchToolForm.valid) {
      this.alertService.showWarning('Please fill all mandatory field(s)');
      return;
    }

    const device = this.deviceData.find(item => item.DeviceId === this.punchToolForm.get('DeviceId').value);
    const emp = this.employeeList.find(item => item.Id === this.punchToolForm.get('EmployeeCode').value);
    const date = moment(this.punchToolForm.get('Date').value).format("DD-MM-YYYY");
    const time = `${this.punchToolForm.get('selectedHour').value}:${this.punchToolForm.get('selectedMinute').value}`;

    const logTime = moment(`${date} ${time}`, 'DD-MM-YYYY HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    const displayTime = moment(`${date} ${time}`, 'DD-MM-YYYY HH:mm:ss').format("DD-MM-YYYY HH:mm:ss");

    const userData = {
      ClientId: this.clientId,
      ClientContractId: this.clientContractId,
      EmployeeCode: emp.Code,
      Date: date,
      LogTime: logTime,
      DisplayTime: displayTime,
      DeviceId: this.punchToolForm.get('DeviceId').value,
      Locationcode: device ? device.DeviceName : '',
    };
    this.addedPuncheDetails.push(userData);
    this.sortPuncheDetails();
  }

  sortPuncheDetails() {
    this.addedPuncheDetails = this.addedPuncheDetails.sort((a, b) => new Date(a.LogTime).getTime() - new Date(b.LogTime).getTime());
    console.log('NewPunch', this.addedPuncheDetails);
  }


  onClickSubmitPunches() {
    let punchData = {
      DeleteOld: this.deleteOldPunches,
      Data: []
    };
    if (!this.punchToolForm.valid) {
      this.alertService.showWarning('Please fill all mandatory field(s)');
      return;
    }
    if (this.addedPuncheDetails.length) {
      punchData.Data = this.addedPuncheDetails.map(({ Date, DisplayTime, ...rest }) => rest);
    } else {
      this.alertService.showWarning('Please click on "Add" button before you submit !');
      return;
    }
    console.log(punchData);
    this.alertService.confirmSwal("Are you sure you want to submit your changes? ", "You can't revert these changes", "Yes").then((res) => {
      this.doTriggerSubmitFn(punchData);
    });
    
  }

  doTriggerSubmitFn(data) {
    this.loadingScreen.startLoading();
    this.attendanceService.pushBiometricDataManually(data).subscribe((response) => {
      this.loadingScreen.stopLoading();
      this.spinner = false;
      this.showSuccessData = true;
      this.savedBiometricData = [];
      if (response.Status && response.Result && response.Result != "") {
        this.savedBiometricData = response.Result;
        this.resetValues();
        this.alertService.showSuccess('Data updated successfully !');
      } else {
        this.alertService.showWarning(response.Message);
        console.error('ERROR IN pushBiometricDataManually API -->', response);
      }
    }, err => {
      this.loadingScreen.stopLoading();
      console.error('ERROR IN pushBiometricDataManually API -->', err);
    });
  }

  resetValues() {
    this.punchToolForm.reset();
    this.deleteOldPunches = false;
    this.addedPuncheDetails = [];
    this.existingPuncheDetails = [];
    this.setDefaultDeviceId();
  }

  onChangeDeletePunches(evt) {
    if (evt.target.checked) {

      this.deleteOldPunches = true;
    } else {

      this.deleteOldPunches = false;
    }
    console.log(evt.target.checked);
  }

  onClickingClearBtn() {
    this.addedPuncheDetails = [];
    this.punchToolForm.controls['selectedHour'].setValue(null);
    this.punchToolForm.controls['selectedMinute'].setValue(null);
    // this.punchToolForm.controls['DeviceId'].setValue(null);
  }

  setDefaultDeviceId() {
    const defaultDevice = this.deviceData.find(device => Number(device.DeviceId) === 0);
    if (defaultDevice) {
      this.punchToolForm.controls['DeviceId'].setValue(defaultDevice.DeviceId);
    } else {
      this.punchToolForm.controls['DeviceId'].enable();
    }
  }

}
