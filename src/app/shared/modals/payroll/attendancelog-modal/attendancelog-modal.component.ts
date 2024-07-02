import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { PayrollService } from 'src/app/_services/service/payroll.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SaleOrder } from 'src/app/_services/model/Payroll/PayRun';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from './../../../../_services/service/alert.service';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'app-attendancelog-modal',
  templateUrl: './attendancelog-modal.component.html',
  styleUrls: ['./attendancelog-modal.component.css']
})
export class AttendancelogModalComponent implements OnInit {
  @Input() objJson: any;

  SOForm: FormGroup;
  submitted = false; radioItems: Array<string>;
  isValidDates = true;
  @Input() IsLOP : boolean ;

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,

  ) { }

  ngOnInit() {
    this.isValidDates = true;
    this.radioItems = ['Present', 'Absent'];
    this.createForm();
    console.log('obj', this.objJson);
    console.log('isLOP' , this.IsLOP);
    this.SOForm.patchValue({
      // NameofTitle: this.objJson.title,
      StartDate: (this.objJson.start),
      EndDate: (this.objJson.end),
      isHalfDay: this.objJson.meta.IsFirstDayHalf,
      Action:  this.objJson.color.primary === "#3BBD72" ? 'Present' : this.objJson.color.primary === "#ad2121"  ? 'Absent' : this.objJson.color.primary === "#e3bc08" ? 'RevokeLOP' : 'Others' 
    });
  }

  get g() { return this.SOForm.controls; } // reactive forms validation 

  createForm() {
    this.SOForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      // NameofTitle: [null, Validators.required],
      StartDate: [null, Validators.required],
      EndDate: [null, Validators.required],
      Action: this.IsLOP ==  true ? ['Absent'] : [''],
      isHalfDay: [false],
    });
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }
  Save() {
    this.submitted = true;
    if (this.SOForm.invalid) {
      this.alertService.showWarning("Please fill the required items!");
      return;
    }
    if (this.SOForm.controls.Action.value == 'Present') {
      this.SOForm.controls['isHalfDay'].setValue(false);
    }
    if (this.SOForm.controls.Action.value == 'Absent' && !this.IsLOP) {
      this.SOForm.controls['isHalfDay'].setValue(false);
    }
    console.log('ev', this.SOForm.value);
    this.activeModal.close(this.SOForm.value);
  }


  onChangestartDate(e){

    (this.SOForm.controls.StartDate.value != null && this.SOForm.controls.EndDate.value != null ? (this.isValidDates = (new Date(Date.parse(this.SOForm.controls.StartDate.value)) <= new Date(Date.parse(this.SOForm.controls.EndDate.value)) ||new Date(Date.parse(this.SOForm.controls.StartDate.value)) <= new Date(Date.parse(this.SOForm.controls.EndDate.value)) )? false : true ) : this.isValidDates = false);
  }
  onChangeendDate(e){

    (this.SOForm.controls.StartDate.value != null && this.SOForm.controls.EndDate.value != null ? (this.isValidDates = (new Date(Date.parse(this.SOForm.controls.StartDate.value)) !== new Date(Date.parse(this.SOForm.controls.EndDate.value))) ? false : true ) : this.isValidDates = false);

  }
}
