import { Component, OnInit, Input} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../_services/service/alert.service';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';

@Component({
  selector: 'app-create-activity-by-employee',
  templateUrl: './create-activity-by-employee.component.html',
  styleUrls: ['./create-activity-by-employee.component.css']
})
export class CreateActivityByEmployeeComponent implements OnInit {

  @Input() data: any;

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  spinner: boolean = false;
  createActivityForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private timesheetService: TimesheetService,
    private sessionService: SessionStorage,
  ) { }

  get f() { return this.createActivityForm.controls; }

  ngOnInit() {
    this.spinner = true;
    console.log(this.data, JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)));
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;

    this.createActivityForm = this.formBuilder.group({
      Id: [0],
      ProjectId: [null, Validators.required],
      Code: [null, Validators.required],
      Name: [null, Validators.required],
      Description: [''],
      Status : [true],
      IsBillable: [true]
    });
    this.spinner = false;
  }


  closeModal() {
    this.activeModal.close('Modal Closed');
  }

  closeModalWithData(data: any) {
    this.activeModal.close(data);
  }

  saveActivityByEmployee() {
    this.spinner = true;
    if (this.createActivityForm.invalid) {
      this.spinner = false;
      return this.alertService.showInfo('Please fill all required fields !')
    }
    const saveData = this.createActivityForm.getRawValue();
    saveData.CreatedOn = new Date().toISOString(),
    saveData.LastUpdatedOn = new Date().toISOString(),
    saveData.CreatedBy = this.UserId,
    saveData.LastUpdatedBy = this.UserId
    console.log('Save', saveData);
    // return this.spinner = false;
    this.timesheetService.put_UpsertProjectActivityMapping(JSON.stringify(saveData)).subscribe((res) => {
      this.spinner = false;
      console.log('Activity Upsert Response -->', res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.closeModalWithData(res.Result);
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
  }

}
