import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzDrawerRef } from 'ng-zorro-antd';
import { LoginResponses, UIMode, UserStatus } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import moment from 'moment';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';

@Component({
  selector: 'app-update-employee-project-mapping',
  templateUrl: './update-employee-project-mapping.component.html',
  styleUrls: ['./update-employee-project-mapping.component.css']
})
export class UpdateEmployeeProjectMappingComponent implements OnInit {

  @Input() rowData: any;
  @Input() action: string;

  projectList = [];
  projectId: any;
  selectedStartDate: any;
  selectedEndDate: any;
  spinner: boolean = false;
  minDate: Date;
  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    private loadingScreenService : LoadingScreenService
  ) { }

  ngOnInit() {
    this.spinner = true;
    console.log('rowData', this.rowData);
    this.projectId = this.rowData.ProjectId;
    this.minDate = new Date();
    this.selectedEndDate = new Date(this.rowData.EndDate); 
    this.selectedStartDate = new Date(this.rowData.StartDate); 
    if (moment(this.selectedStartDate).isBefore(moment(this.minDate))) {
      this.selectedStartDate = this.minDate;
    }

    if (moment(this.selectedEndDate).isBefore(moment(this.minDate))) {
      this.selectedEndDate = this.minDate;
    }
    this.timesheetservice.get_ProjectsForAClient(this.rowData.ClientId, this.rowData.ClientContractId).subscribe(result => {
      console.log('result', result);
      if (result.Status && result.Result != '') {
        this.projectList = JSON.parse(result.Result);
        this.spinner = false;
      }
    });
  }

  onChangeProject(e) {

  }

  onChangeStartDate(e) {
    console.log('onChangeStartDate', e);
    if (e) {
      this.selectedStartDate = new Date(e);
      this.selectedEndDate = new Date(e);
    }
  }

  onChangeEndDate(e) {
    console.log('onChangeEndDate', e);
    if (e) {
      this.selectedEndDate = new Date(e);
    }
  }

  closeDrawer(): void {
    this.drawerRef.close(this.rowData);
  }

  clickedSubmitFn() {
    this.spinner = true;
    this.rowData.ProjectId = this.projectId;
    this.rowData.StartDate = moment(new Date(this.selectedStartDate)).format('MM-DD-YYYY');
    this.rowData.EndDate = moment(new Date(this.selectedEndDate)).format('MM-DD-YYYY');

    const project = this.projectList.find(a => a.Id === this.projectId);
    const startDate = new Date(project.StartDate);
    const endDate = new Date(project.EndDate);
    const isStartDateInRange = this.isDateInRange(this.selectedStartDate, startDate, endDate);
    const isEndDateInRange = this.isDateInRange(this.selectedEndDate, startDate, endDate);
    
    
    if (!isStartDateInRange || !isEndDateInRange) {
      const rangeText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      this.spinner = false;
      return this.alertService.showWarning(`The start date / end date should be within ${rangeText} range`);
    }
    console.log('UPDATE', this.rowData);
    // CALL API TO SAVE IN DB
    this.timesheetservice.put_UpsertProjectEmployeeMapping(JSON.stringify(this.rowData)).subscribe((res) => {
      this.spinner = false;
      console.log('SUBMIT FOR ALL -->', res);
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.closeDrawer();
      } else {
        this.alertService.showWarning(res.Message);
      }
    });
    
  }

  isDateInRange(date, startDate, endDate) {
    // splitting to avoid error
    let from = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let to = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    let currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Convert to UTC
    from.setUTCHours(0, 0, 0, 0);   
    to.setUTCHours(0, 0, 0, 0);
    currentDate.setUTCHours(0, 0, 0, 0);

    return currentDate >= from && currentDate <= to;
  }

}
