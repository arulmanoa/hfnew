import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AttendanceConfiguration, AttendanceConfigurationMapping, WorkShiftDefinition, WorkShiftDefinitionMapping, Location, AttendanceGeoFencingCoordinateMapping, Coordinates } from 'src/app/_services/model/Attendance/AttendanceConfiguration';
import Swal from "sweetalert2";
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// // import { ContractlistComponent } from 'src/app/shared/components/contractlist/contractlist.component';
// import { TeamlistComponent } from 'src/app/shared/components/teamlist/teamlist.component';
// import { ClientlistComponent } from 'src/app/shared/components/clientlist/clientlist.component';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { ApiResponse } from 'src/app/_services/model/Common/BaseModel';
// import { EmployeeListComponent } from 'src/app/shared/components/employee-list/employee-list.component';
import { LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ClientContactService } from 'src/app/_services/service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { ClientContractService } from 'src/app/_services/service/clientContract.service';
import { ClientService } from 'src/app/_services/service/client.service';
import { EmployeeService } from 'src/app/_services/service';
import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
} from 'angular-slickgrid';
import { UUID } from 'angular2-uuid';
import { forEach } from 'lodash';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  activeTabName: string;
  label1: string = "Is present By Default";
  constructor(private formBuilder: FormBuilder,
    private rowdataservice: RowDataService,
    public modalService: NgbModal,
    private attendanceservice: AttendanceService,
    private sessionservice: SessionStorage,
    private ClientContactService: ClientContactService,
    private clientcontractservice: ClientContractService,
    private clientservice: ClientService,
    private employeeService: EmployeeService,
  ) { }

  attendanceConfiguration: FormGroup;
  attendanceMappingForm: FormGroup;
  shiftMappingForm: FormGroup;
  GeoFencingForm: FormGroup;
  attendanceConfigurationdetails: AttendanceConfiguration = {} as any;
  attendanceConfigurationMapping: AttendanceConfigurationMapping = {} as any;
  WorkShiftDefinition: WorkShiftDefinition = {} as any;
  LocationDetails: Location = {} as any;
  CoordinateData: Coordinates = {} as any;
  WorkShiftDefinitionMapping: WorkShiftDefinitionMapping = {} as any;
  AttendanceGeoFencingCoordinateMapping: AttendanceGeoFencingCoordinateMapping = {} as any;
  getPunchOut: boolean = false;
  allowtimeinput: boolean = false;
  clientData: any = [];
  panelTitle: any;
  listOfConfiguration: any = [];
  BusinessType: any;
  sessionDetails: LoginResponses;
  companyId: any;
  company: any;
  curentConfiguration: any[] = [];
  Id: number;
  inputTime: boolean = false;
  listOfclient: any[] = [];
  listOfContract: any;
  listOfEmployees: any;
  employee: any;
  chosenclientId: any;
  chosenContract: any;
  listOfTeam: any[] = [];
  jsonObj: any[] = [];
  jsonObj1: any[] = [];
  jsonObj2: any[] = [];
  id: any;
  clientAttendance: any[] = [];
  contractAttendance: any[] = [];
  TeamAttendance: any[] = [];
  EmployeeAttendance: any[] = [];
  chosenTeam: any;
  attendanceMapping: any;
  configResult: any;
  clientShift: any;
  clientCoordinate: any;
  ContractCoordinate: any;
  TeamCoordinate: any;
  EmployeeCoordinate: any;
  CoordinateList: any[] = [];
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  angularGrid: AngularGridInstance;
  gridobj: any;
  AddColumnList: any[] = [];
  NewLocation: any[] = [];
  i = 0;
  IsGeoTaggingRequired=false;
  loadData(event) {

    this.activeTabName = event.nextId;
  }

  // openClientConfigure() {
  //   const modalRef = this.modalService.open(ClientlistComponent);
  //   modalRef.result.then((result) => {
  //     console.log(result);
  //   }).catch((error) => {
  //     console.log(error);
  //   })
  // }

  // openContractConfigure() {
  //   const modalRef = this.modalService.open(ContractlistComponent);
  //   this.panelTitle = "Attendance Configuration";
  //   modalRef.result.then((result) => {
  //     console.log(result);
  //   }).catch((error) => {
  //     console.log(error);
  //   })
  // }

  // openTeamConfigure() {
  //   const modalRef = this.modalService.open(TeamlistComponent);
  //   modalRef.result.then((result) => {
  //     console.log(result);
  //   }).catch((error) => {
  //     console.log(error);
  //   })
  // }


  // openEmployeeConfigure() {
  //   const modalRef = this.modalService.open(EmployeeListComponent);
  //   modalRef.result.then((result) => {
  //     console.log(result);
  //   }).catch((error) => {
  //     console.log(error);
  //   })
  // }

  loadClientLst() {
    this.clientservice.getClientByCompanyId(this.company).subscribe((res) => {
      let apiresponse: apiResponse = res;
      this.listOfclient = apiresponse.dynamicObject;
      console.log('dfd', this.listOfclient);

    }),


      ((err) => {

      });


  }
  clearGrid(event) {
    this.AddColumnList.pop();
    console.log(this.AddColumnList);
  }



  addNewColumn() {


    //this.InitiateGeoForm();
    //  this.AddColumnList[index].Id=0;
    //  this.AddColumnList[index].Longitude=0.000;
    //  this.AddColumnList[index].Latitude=0.000;
    //  this.AddColumnList[index].Radius=0.000;
  

this.i++;
    // console.log(this.LocationDetails);
    let obj = new Coordinates();
    obj.Latitude = null;
    obj.Longitude = null;
    let obj_location = new Location();
    obj_location.Radius = 0;
    obj_location.Coordinates = obj;

    // this.CoordinateData.Longitude =null
    // this.CoordinateData.Latitude = null;
    // console.log(this.CoordinateData);
    // this.LocationDetails.Coordinates = this.CoordinateData;
    // this.LocationDetails.Radius = null;
    // console.log(this.LocationDetails);
      console.log(this.AddColumnList);

 this.AddColumnList.push(obj_location)
    //let coordinatelist = JSON.parse(JSON.stringify(this.CoordinatesDetails));           
    //this.AddColumnList.push(coordinatelist);
    // coordinatelist=[];
    // console.log(this.AddColumnList);
    //JSON.stringify(this.AddColumnList);


    //this.push();

    //console.log(this.CoordinatesDetails);

  }

  push() {
    let coordinatelist = JSON.parse(JSON.stringify(this.LocationDetails));

    this.AddColumnList.push(coordinatelist);
    console.log(this.AddColumnList);
    console.log(coordinatelist);
  }


  ngOnInit() {
    this.activeTabName = 'Generaltab';
    this.attendanceMappingForm = this.formBuilder.group({
      client: [0],
      contract: [0],
      team: [0],
      employee: [0]
    })

    this.sessionDetails = JSON.parse(this.sessionservice.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    console.log(this.sessionDetails);
    this.company = this.sessionDetails.Company.Id;
    console.log(this.companyId);
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    console.log(this.BusinessType);
    console.log(this.company)
    this.InitiateGeoForm();
    this.InitiateShiftMapForm();
    this.InitiateForm();
    this.curentConfiguration = this.rowdataservice.dataInterface.RowData;
    this.loadClientLst();
    //grid for coordinates


  }









  OnchangeClient(client) {
    console.log(client);
    let ClientId = client.Id;
    this.chosenclientId = client.Id;
    this.clientcontractservice.getClientContract(ClientId).subscribe((res) => {
      let apiresponse: apiResponse = res;
      this.listOfContract = apiresponse.dynamicObject;
      console.log('contract of current client', this.listOfContract);
      if (this.activeTabName = 'GeneralTab') {
        this.attendanceConfigurationMapping.ClientId = this.chosenclientId;
        this.attendanceservice.GetAttendanceConfigurationMapping(this.company, this.attendanceConfigurationMapping.ClientId, 0, 0, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.clientAttendance = apiResponse.Result;

          this.jsonObj.push(this.clientAttendance);

          if (this.clientAttendance != undefined || this.clientAttendance != null) {
            this.editAttendanceConfiguration();
          } else {
            this.InitiateForm();
          }



        })
      }
      if (this.activeTabName = 'ShiftMap') {
        this.attendanceservice.getShiftMapping(this.company, this.attendanceConfigurationMapping.ClientId, 0, 0, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.clientShift = apiResponse.Result;
          this.jsonObj1.push(this.clientShift);
          console.log(this.jsonObj1[0]);

          if (this.clientShift != undefined || this.clientShift != null) {
            this.editShiftMapping();
          } else {
            this.InitiateShiftMapForm();
          }
        })
      }
      if (this.activeTabName = 'GeoFencing') {
        this.attendanceservice.GetGeoCoordinates(this.company, this.attendanceConfigurationMapping.ClientId, 0, 0, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.clientCoordinate = apiResponse.Result;
          this.jsonObj2.push(this.clientCoordinate);
          console.log(this.jsonObj2[0][0]);
          if (this.clientCoordinate != undefined || this.clientCoordinate != null) {
            this.editCoordinateMapping();
          } else {
            this.InitiateGeoForm();
          }

        })
      }


    })
  }

  OnchangeContract(contract) {
    console.log(contract);
    let contractId = contract.Id;
    this.chosenContract = contract.Id;
    this.clientservice.getTeamByClientAndContract(this.chosenclientId, contractId).subscribe((res) => {
      let apiresponse: apiResponse = res;
      this.listOfTeam = apiresponse.dynamicObject;
      console.log('team list', this.listOfTeam)

      if (this.activeTabName == 'GeneralTab') {
        this.attendanceservice.GetAttendanceConfigurationMapping(this.company, this.chosenclientId, contractId, 0, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.contractAttendance = apiResponse.Result;
          this.jsonObj = [];
          this.jsonObj.push(this.contractAttendance);
          console.log(this.contractAttendance);
          if (this.contractAttendance != undefined || this.contractAttendance != null) {
            this.editAttendanceConfiguration();
          } else {
            this.InitiateForm();
          }

        })
      }
      if (this.activeTabName = 'ShiftMap') {
        this.attendanceservice.getShiftMapping(this.company, this.attendanceConfigurationMapping.ClientId, contractId, 0, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.clientShift = apiResponse.Result;
          this.jsonObj1 = [];
          this.jsonObj1.push(this.clientShift);
          if (this.clientShift != undefined || this.clientShift != null) {
            this.editShiftMapping();
          } else {
            this.InitiateShiftMapForm();
          }
        })
      }



      if (this.activeTabName = 'GeoFencing') {
        this.attendanceservice.GetGeoCoordinates(this.company, this.attendanceConfigurationMapping.ClientId, contractId, 0, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.ContractCoordinate = apiResponse.Result;
          this.jsonObj2.push(this.ContractCoordinate);

          if (this.ContractCoordinate != undefined || this.ContractCoordinate != null) {
            this.editCoordinateMapping();
          } else {
            this.InitiateGeoForm();
          }

        })
      }
    })


  }




  SaveGeoFencing() {
    console.log('ill perform geo fencing save');

    if (this.jsonObj2[0] == undefined || this.jsonObj2[0] == null) {
      this.AttendanceGeoFencingCoordinateMapping.Id = 0;
      this.AttendanceGeoFencingCoordinateMapping.CompanyId = this.company;
      this.AttendanceGeoFencingCoordinateMapping.ClientId = this.attendanceMappingForm.get("client").value;
      this.AttendanceGeoFencingCoordinateMapping.ClientContractId = this.attendanceMappingForm.get("contract").value;
      this.AttendanceGeoFencingCoordinateMapping.TeamId = this.attendanceMappingForm.get("team").value;
      this.AttendanceGeoFencingCoordinateMapping.EmployeeId = this.attendanceMappingForm.get("employee").value;
      this.AttendanceGeoFencingCoordinateMapping.Status = this.GeoFencingForm.get("status").value;
      this.AttendanceGeoFencingCoordinateMapping.Locations = this.AddColumnList;
      this.AttendanceGeoFencingCoordinateMapping.IsLatest = this.GeoFencingForm.get("IsLatest").value;
      console.log(this.AttendanceGeoFencingCoordinateMapping);

    }
    else {
      this.AttendanceGeoFencingCoordinateMapping.Id = this.jsonObj2[0][0].Id;
      this.AttendanceGeoFencingCoordinateMapping.CompanyId = this.company;
      this.AttendanceGeoFencingCoordinateMapping.ClientId = this.attendanceMappingForm.get("client").value;
      this.AttendanceGeoFencingCoordinateMapping.ClientContractId = this.attendanceMappingForm.get("contract").value;
      this.AttendanceGeoFencingCoordinateMapping.TeamId = this.attendanceMappingForm.get("team").value;
      this.AttendanceGeoFencingCoordinateMapping.EmployeeId = this.attendanceMappingForm.get("employee").value;
      this.AttendanceGeoFencingCoordinateMapping.Status = this.GeoFencingForm.get("status").value;
      this.AttendanceGeoFencingCoordinateMapping.Locations = this.AddColumnList;

    }
    let req_param = JSON.stringify(this.AttendanceGeoFencingCoordinateMapping);
    console.log(req_param);
    this.attendanceservice.UpsertAttendanceGeoFenceCoordinatesMapping(req_param).subscribe(res => {
      console.log(res);
    })
  }


  OnchangeTeam(team) {
    console.log(team);
    let teamId = team.Id;
    this.chosenTeam = teamId;
    this.employeeService.GetEmployeeByTeam(this.chosenclientId, this.chosenContract, teamId).subscribe((res) => {
      let apiresponse: ApiResponse = res;
      this.employee = apiresponse.Result
      this.listOfEmployees = JSON.parse(this.employee);
      console.log('employees', this.listOfEmployees);
      if (this.activeTabName == 'GeneralTab') {

        this.attendanceservice.GetAttendanceConfigurationMapping(this.company, this.chosenclientId, this.chosenContract, teamId, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.TeamAttendance = apiResponse.Result;
          this.jsonObj = [];
          this.jsonObj.push(this.TeamAttendance);

          if (this.TeamAttendance != undefined || this.TeamAttendance != null) {
            this.editAttendanceConfiguration();
          } else {
            this.InitiateForm();
          }

        })
      }
      if (this.activeTabName = 'ShiftMap') {
        this.attendanceservice.getShiftMapping(this.company, this.attendanceConfigurationMapping.ClientId, this.chosenContract, teamId, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.clientShift = apiResponse.Result;
          this.jsonObj1 = []
          this.jsonObj1.push(this.clientShift);
          if (this.clientShift != undefined || this.clientShift != null) {
            this.editShiftMapping();
          } else {
            this.InitiateShiftMapForm();
          }
        })
      }
      if (this.activeTabName = 'GeoFencing') {
        this.attendanceservice.GetGeoCoordinates(this.company, this.attendanceConfigurationMapping.ClientId, this.chosenContract, teamId, 0).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.TeamCoordinate = apiResponse.Result;
          this.jsonObj2.push(this.TeamCoordinate);

          if (this.TeamCoordinate != undefined || this.TeamCoordinate != null) {
            // this.editCoordinateMapping();
          } else {
            //this.InitiateGeoForm();
          }

        })
      }


    })
  }

  OnchangeEmployee(employee) {
    let employeeId = employee.Id;
    this.attendanceservice.GetAttendanceConfigurationMapping(this.company, this.chosenclientId, this.chosenContract, this.chosenTeam, employeeId).subscribe(res => {
      console.log(res);
      let apiResponse: ApiResponse = res;
      this.EmployeeAttendance = apiResponse.Result;
      if (this.activeTabName = 'GeneralTab') {
        this.jsonObj = [];
        this.jsonObj.push(this.EmployeeAttendance);

        if (this.EmployeeAttendance != undefined || this.EmployeeAttendance != null) {
          this.editAttendanceConfiguration();
        } else {
          this.InitiateForm();
        }
      }
      if (this.activeTabName = 'ShiftMap') {
        this.attendanceservice.getShiftMapping(this.company, this.attendanceConfigurationMapping.ClientId, this.chosenContract, this.chosenTeam, employeeId).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.clientShift = apiResponse.Result;
          this.jsonObj1 = [];
          this.jsonObj1.push(this.clientShift);
          if (this.clientShift != undefined || this.clientShift != null) {
            this.editShiftMapping();
          } else {
            this.InitiateShiftMapForm();
          }
        })
      }
      if (this.activeTabName = 'GeoFencing') {
        this.attendanceservice.GetGeoCoordinates(this.company, this.attendanceConfigurationMapping.ClientId, this.chosenContract, this.chosenTeam, employeeId).subscribe(res => {
          console.log(res);
          let apiResponse: ApiResponse = res;
          this.EmployeeCoordinate = apiResponse.Result;
          this.jsonObj2.push(this.EmployeeCoordinate);

          if (this.EmployeeCoordinate != undefined || this.EmployeeCoordinate != null) {
            // this.editCoordinateMapping();
          } else {
            //this.InitiateGeoForm();
          }

        })
      }

    })


  }

  OnchangeGeoFenceCheck(){
    if(this.attendanceConfiguration.get("IsGeoFenceRequired").value==true){
      this.IsGeoTaggingRequired=true;
    }else{
      this.IsGeoTaggingRequired=false;
    }
  }


  OnchangeCheck(event) {
    if (this.attendanceConfiguration.get("IsAutoPunchOutEnabled").value == true) {
      this.getPunchOut = true;
      if (this.attendanceConfiguration.get("IsAllowToInputTimeForPunchOut").value == true) {
        this.allowtimeinput = true;
      } else {
        this.allowtimeinput = false;
      }
    }
    else {
      this.getPunchOut = false;
      this.allowtimeinput = false;
    }
    


  }

  InitiateForm() {
    this.attendanceConfiguration = this.formBuilder.group({
      Id: [0],
      status: [1],
      code: [''],
      description: [''],
      IsPresentByDefault: [false],
      IsDailyPunchinRequired: [false],
      IsAllowMultiplePunches: [false],
      IsAllowEmployeeToInputMultipleWorkingHours: [false],
      IsUseDefaultWorkingHoursFromShiftDefinition: [false],
      IsTimeCalulationRequiredBsedOnMultiplePunches: [false],
      IsAutoPunchOutEnabled: [false],
      IsAllowToInputTimeForPunchIn: [false],
      IsAllowToInputTimeForPunchOut: [false],
      IsAllowToChangeAutoPunchOutIfAutoPunched: [false],
      IsGeoFenceRequired: [false],
      IsNetworkRestrictionRequired: [false],
      IsGeoTaggingRequired: [false],
      IsImageCaptureRequiredWhilePunchIn: [false],
      IsImageCaptureRequiredWhilePunchOut: [false],
      IsHourBasedAttendanceTypeMarkingRequired: [false],
      IsAllowToPunchOnHoliday: [false],
      IsAllowToPunchOnNonPayableDay: [false],
      IsAllowToEditInAndOutTimesForPastDays: [false],
      AutoPunchOutSchedule: [''],

    })
  }
  InitiateShiftMapForm() {
    this.shiftMappingForm = this.formBuilder.group({
      status: [0],
      Code: [''],
      Name: [''],
      StartTime: [''],
      EndTime: [''],
      DefaultWorkingHours: ['']
    });
  }

  InitiateGeoForm() {

    this.GeoFencingForm = this.formBuilder.group({
      Id: [0],
      Longitude: [0],
      Latitude: [0],
      Radius: [0],
      EffectiveFrom: [0],
      status: [1],
      IsLatest: [1]
    })
  }
  InitiateCoordinateForm() {
    this.GeoFencingForm = this.formBuilder.group({
      Longitude: [0],
      Latitude: [0],
      Radius: [0]
    })
  }
  editCoordinateMapping() {
    this.AddColumnList = this.jsonObj2[0][0].Locations;
    this.GeoFencingForm.patchValue({
      "Id": this.jsonObj2[0][0].Id,
      // "Longitude":this.jsonObj2[0][0].Locations.Coordinates.Longitude,
      // "Latitude":this.jsonObj2[0][0].Locations.Coordinates.Latitude,
      // "Radius":this.jsonObj2[0][0].Locations.Radius,
      "status": this.jsonObj2[0][0].Status,
      "IsLatest": this.jsonObj2[0][0].IsLatest,
      "EffectiveFrom": this.jsonObj2[0][0].EffectiveFrom,

    })

  }


  ResetButton() {
    this.attendanceMappingForm = this.formBuilder.group({
      client: [0],
      contract: [0],
      team: [0],
      employee: [0]
    })

  }
  onChangeStartDate(event) {

    /* if (this.clientContractForm.get('ValidFrom').value != null || this.clientContractForm.get('ValidFrom').value != undefined) {
       var StartDate = new Date(event);
       this.ContractminDate = new Date();
       this.ContractminDate.setMonth(StartDate.getMonth());
       this.ContractminDate.setDate(StartDate.getDate() + 1);
       this.ContractminDate.setFullYear(StartDate.getFullYear());
     }*/
  }

  AddNewRow() {

  }

  SaveWorkShift() {
    if (this.activeTabName = "ShiftMap") {
      console.log(this.jsonObj1[0]);
      if (this.jsonObj1[0] == undefined || this.jsonObj1[0] == null) {
        this.WorkShiftDefinition.Id = 0;
        this.WorkShiftDefinition.Code = this.shiftMappingForm.get("Code").value;
        this.WorkShiftDefinition.Name = this.shiftMappingForm.get("Name").value;
        this.WorkShiftDefinition.StartTime = this.shiftMappingForm.get("StartTime").value;
        this.WorkShiftDefinition.EndTime = this.shiftMappingForm.get("EndTime").value;
        this.WorkShiftDefinition.DefaultWorkingHour = this.shiftMappingForm.get("DefaultWorkingHours").value;
        this.WorkShiftDefinitionMapping.CompanyId = this.company;
        this.WorkShiftDefinitionMapping.ClientId = this.attendanceMappingForm.get("client").value;
        this.WorkShiftDefinitionMapping.ClientContractId = this.attendanceMappingForm.get("contract").value;;
        this.WorkShiftDefinitionMapping.TeamId = this.attendanceMappingForm.get("team").value;
        this.WorkShiftDefinitionMapping.Id = 0;
        this.WorkShiftDefinitionMapping.EmployeeId = this.attendanceMappingForm.get("employee").value;
        let shiftmapping_save_param = JSON.stringify({ WorkShiftDefinition: this.WorkShiftDefinition, WorkShiftMapping: this.WorkShiftDefinitionMapping });
        console.log(shiftmapping_save_param);
        this.attendanceservice.UpsertWorkShiftAndMapping(shiftmapping_save_param).subscribe(res => {
          console.log(res);
        })
      } else {
        console.log('edit initiated');
        this.WorkShiftDefinition.Id = this.jsonObj1[0][0].Id;
        this.WorkShiftDefinition.Code = this.shiftMappingForm.get("Code").value;
        this.WorkShiftDefinition.Name = this.shiftMappingForm.get("Name").value;
        this.WorkShiftDefinition.StartTime = this.shiftMappingForm.get("StartTime").value;
        this.WorkShiftDefinition.EndTime = this.shiftMappingForm.get("EndTime").value;
        this.WorkShiftDefinition.DefaultWorkingHour = this.shiftMappingForm.get("DefaultWorkingHours").value;
        this.WorkShiftDefinition.Status = true;
        let shift_edit_req = JSON.stringify(this.WorkShiftDefinition);
        console.log(shift_edit_req);
        this.attendanceservice.UpdateWorkShiftDefinition(shift_edit_req).subscribe(res => {
          console.log(res);
        })
      }


    }
    else {
      console.log("this in not shift map");
    }
  }


  saveAttendanceConfigurationbutton() {
    console.log(this.jsonObj[0]);
    if (this.jsonObj[0] == null || this.jsonObj[0] == undefined) {
      this.attendanceConfigurationdetails.Id = 0;
      this.attendanceConfigurationdetails.Code = this.attendanceConfiguration.get("code").value;
      this.attendanceConfigurationdetails.Description = this.attendanceConfiguration.get("description").value;
      this.attendanceConfigurationdetails.ModeOfInput = 0;
      this.attendanceConfigurationdetails.IsPresentByDefault = this.attendanceConfiguration.get("IsPresentByDefault").value;
      this.attendanceConfigurationdetails.IsDailyPunchRequired = this.attendanceConfiguration.get("IsDailyPunchinRequired").value;
      this.attendanceConfigurationdetails.IsAllowMultiplePunches = this.attendanceConfiguration.get("IsAllowMultiplePunches").value;
      this.attendanceConfigurationdetails.IsAllowEmployeeToInputWorkingHours = this.attendanceConfiguration.get("IsAllowEmployeeToInputMultipleWorkingHours").value;
      this.attendanceConfigurationdetails.IsUseDefaultWorkingHoursFromShiftDefinition = this.attendanceConfiguration.get("IsUseDefaultWorkingHoursFromShiftDefinition").value;
      this.attendanceConfigurationdetails.IsTimeCalculationRequiredBaseOnMultiplePunches = this.attendanceConfiguration.get("IsTimeCalulationRequiredBsedOnMultiplePunches").value;
      this.attendanceConfigurationdetails.IsAutoPunchOutEnabled = this.attendanceConfiguration.get("IsAutoPunchOutEnabled").value;
      this.attendanceConfigurationdetails.AutoPunchOutSchedule = this.attendanceConfiguration.get("AutoPunchOutSchedule").value;
      this.attendanceConfigurationdetails.IsAllowToInputTimeForPunchIn = this.attendanceConfiguration.get("IsAllowToInputTimeForPunchIn").value;
      this.attendanceConfigurationdetails.IsAllowToInputTimeForPunchOut = this.attendanceConfiguration.get("IsAllowToInputTimeForPunchOut").value;
      this.attendanceConfigurationdetails.IsAllowToChangePunchOutIfAutoPunched = this.attendanceConfiguration.get("IsAllowToChangeAutoPunchOutIfAutoPunched").value;
      this.attendanceConfigurationdetails.IsGeoFenceRequired = this.attendanceConfiguration.get("IsGeoFenceRequired").value;
      this.attendanceConfigurationdetails.GeoFenceCoordinatesList = null;
      this.attendanceConfigurationdetails.IsNetworkRestrictionRequired = this.attendanceConfiguration.get("IsNetworkRestrictionRequired").value;
      this.attendanceConfigurationdetails.AllowedNetworkList = null;
      this.attendanceConfigurationdetails.IsGeoTaggingRequired = this.attendanceConfiguration.get("IsGeoTaggingRequired").value;
      this.attendanceConfigurationdetails.IsImageCaptureRequiredWhilePunchIn = this.attendanceConfiguration.get("IsImageCaptureRequiredWhilePunchIn").value;
      this.attendanceConfigurationdetails.IsImageCaptureRequiredWhilePunchOut = this.attendanceConfiguration.get("IsImageCaptureRequiredWhilePunchOut").value;
      this.attendanceConfigurationdetails.IsHoursBasedAttendanceTypeMarkingRequired = this.attendanceConfiguration.get("IsHourBasedAttendanceTypeMarkingRequired").value;
      this.attendanceConfigurationdetails.AttendanceTypeMarkingScale = null;
      this.attendanceConfigurationdetails.IsAllowToPunchOnHoliday = this.attendanceConfiguration.get("IsAllowToPunchOnHoliday").value;
      this.attendanceConfigurationdetails.IsAllowToPunchOnNonPayableDay = this.attendanceConfiguration.get("IsAllowToPunchOnNonPayableDay").value;
      this.attendanceConfigurationdetails.IsAllowToEditInAndOutTimesForPastDays = this.attendanceConfiguration.get("IsAllowToEditInAndOutTimesForPastDays").value;
      this.attendanceConfigurationdetails.MaxPastDaysThatCanBeEdited = 0;
      this.attendanceConfigurationdetails.Status = 1;
      // this.attendanceConfigurationMapping.AttendanceConfigurationId=this.attendanceConfigurationdetails.Id;
      this.attendanceConfigurationMapping.ClientId = this.attendanceMappingForm.get("client").value;
      this.attendanceConfigurationMapping.CompanyId = this.company;
      this.attendanceConfigurationMapping.ClientContractId = this.attendanceMappingForm.get("contract").value;
      this.attendanceConfigurationMapping.TeamId = this.attendanceMappingForm.get("team").value;
      this.attendanceConfigurationMapping.EmployeeId = this.attendanceMappingForm.get("employee").value;
      this.attendanceConfigurationMapping.AttendanceConfiguration = this.attendanceConfigurationdetails;
      this.attendanceConfigurationMapping.AttendanceCycleId = 1;
      this.attendanceConfigurationMapping.AttendanceDisplayName = null;
      this.attendanceConfigurationMapping.AttendanceDisplayShortCode = null;
      this.attendanceConfigurationMapping.Id = 0;
      this.attendanceConfigurationMapping.Status = this.attendanceConfiguration.get("status").value;
      this.attendanceConfigurationdetails.ModeOfInput = 0;
      var att_details_req_param = JSON.stringify(this.attendanceConfigurationMapping);
      this.attendanceservice.upsertAttendanceConfiguration(att_details_req_param).subscribe(res => {
        console.log(res);
      })
    }
    else {
      this.attendanceConfigurationdetails.Id = this.jsonObj[0][0].Id;
      this.attendanceConfigurationdetails.Code = this.attendanceConfiguration.get("code").value;
      this.attendanceConfigurationdetails.Description = this.attendanceConfiguration.get("description").value;
      this.attendanceConfigurationdetails.ModeOfInput = 0;
      this.attendanceConfigurationdetails.IsPresentByDefault = this.attendanceConfiguration.get("IsPresentByDefault").value;
      this.attendanceConfigurationdetails.IsDailyPunchRequired = this.attendanceConfiguration.get("IsDailyPunchinRequired").value;
      this.attendanceConfigurationdetails.IsAllowMultiplePunches = this.attendanceConfiguration.get("IsAllowMultiplePunches").value;
      this.attendanceConfigurationdetails.IsAllowEmployeeToInputWorkingHours = this.attendanceConfiguration.get("IsAllowEmployeeToInputMultipleWorkingHours").value;
      this.attendanceConfigurationdetails.IsUseDefaultWorkingHoursFromShiftDefinition = this.attendanceConfiguration.get("IsUseDefaultWorkingHoursFromShiftDefinition").value;
      this.attendanceConfigurationdetails.IsTimeCalculationRequiredBaseOnMultiplePunches = this.attendanceConfiguration.get("IsTimeCalulationRequiredBsedOnMultiplePunches").value;
      this.attendanceConfigurationdetails.IsAutoPunchOutEnabled = this.attendanceConfiguration.get("IsAutoPunchOutEnabled").value;
      this.attendanceConfigurationdetails.AutoPunchOutSchedule = this.attendanceConfiguration.get("AutoPunchOutSchedule").value;
      this.attendanceConfigurationdetails.IsAllowToInputTimeForPunchIn = this.attendanceConfiguration.get("IsAllowToInputTimeForPunchIn").value;
      this.attendanceConfigurationdetails.IsAllowToInputTimeForPunchOut = this.attendanceConfiguration.get("IsAllowToInputTimeForPunchOut").value;
      this.attendanceConfigurationdetails.IsAllowToChangePunchOutIfAutoPunched = this.attendanceConfiguration.get("IsAllowToChangeAutoPunchOutIfAutoPunched").value;
      this.attendanceConfigurationdetails.IsGeoFenceRequired = this.attendanceConfiguration.get("IsGeoFenceRequired").value;
      this.attendanceConfigurationdetails.GeoFenceCoordinatesList = null;
      this.attendanceConfigurationdetails.IsNetworkRestrictionRequired = this.attendanceConfiguration.get("IsNetworkRestrictionRequired").value;
      this.attendanceConfigurationdetails.AllowedNetworkList = null;
      this.attendanceConfigurationdetails.IsGeoTaggingRequired = this.attendanceConfiguration.get("IsGeoTaggingRequired").value;
      this.attendanceConfigurationdetails.IsImageCaptureRequiredWhilePunchIn = this.attendanceConfiguration.get("IsImageCaptureRequiredWhilePunchIn").value;
      this.attendanceConfigurationdetails.IsImageCaptureRequiredWhilePunchOut = this.attendanceConfiguration.get("IsImageCaptureRequiredWhilePunchOut").value;
      this.attendanceConfigurationdetails.IsHoursBasedAttendanceTypeMarkingRequired = this.attendanceConfiguration.get("IsHourBasedAttendanceTypeMarkingRequired").value;
      this.attendanceConfigurationdetails.AttendanceTypeMarkingScale = null;
      this.attendanceConfigurationdetails.IsAllowToPunchOnHoliday = this.attendanceConfiguration.get("IsAllowToPunchOnHoliday").value;
      this.attendanceConfigurationdetails.IsAllowToPunchOnNonPayableDay = this.attendanceConfiguration.get("IsAllowToPunchOnNonPayableDay").value;
      this.attendanceConfigurationdetails.IsAllowToEditInAndOutTimesForPastDays = this.attendanceConfiguration.get("IsAllowToEditInAndOutTimesForPastDays").value;
      this.attendanceConfigurationdetails.MaxPastDaysThatCanBeEdited = 0;
      this.attendanceConfigurationdetails.Status = 1;
      // this.attendanceConfigurationMapping.AttendanceConfigurationId=this.attendanceConfigurationdetails.Id;
      // this.attendanceConfigurationMapping.ClientId=this.attendanceMappingForm.get("client").value;
      // this.attendanceConfigurationMapping.CompanyId=this.company;
      // this.attendanceConfigurationMapping.ClientContractId=this.attendanceMappingForm.get("contract").value;
      // this.attendanceConfigurationMapping.TeamId=this.attendanceMappingForm.get("team").value;
      // this.attendanceConfigurationMapping.EmployeeId=this.attendanceMappingForm.get("employee").value;
      // this.attendanceConfigurationMapping.AttendanceConfiguration=this.attendanceConfigurationdetails;
      // this.attendanceConfigurationMapping.AttendanceCycleId=0;
      // this.attendanceConfigurationMapping.AttendanceDisplayName=null;
      // this.attendanceConfigurationMapping.AttendanceDisplayShortCode=null;
      // //this.attendanceConfigurationMapping.Id=this.attendanceMapping.Id;
      // this.attendanceConfigurationMapping.Status=this.attendanceConfiguration.get("status").value;
      // this.attendanceConfigurationdetails.ModeOfInput=0;


      var attendanceConfig_req_param = JSON.stringify(this.attendanceConfigurationdetails);
      console.log(attendanceConfig_req_param);

      this.attendanceservice.InsertAttendanceConfiguration(attendanceConfig_req_param).subscribe(res => {
        console.log(res);
      });
    }



    /*var attendance_req_Param = JSON.stringify(this.attendanceConfigurationdetails);
    console.log(attendance_req_Param);
    this.attendanceservice.InsertAttendanceConfiguration(attendance_req_Param).subscribe(res=>{
      console.log(res);
    });*/



  }

  editShiftMapping() {
    this.shiftMappingForm.patchValue({
      "Id": this.jsonObj1[0][0].Id,
      "Code": this.jsonObj1[0][0].Code,
      "Name": this.jsonObj1[0][0].Name,
      "StartTime": this.jsonObj1[0][0].StartTime,
      "EndTime": this.jsonObj1[0][0].EndTime,
      "DefaultWorkingHours": this.jsonObj1[0][0].DefaultWorkingHours
    });
  }



  editAttendanceConfiguration() {
    console.log(this.jsonObj[0][0]);
    this.attendanceConfiguration.patchValue({
      // console.log(
      //   'test ::', this.attendanceConfiguration.value
      // );

      "Id": this.jsonObj[0][0].Id,
      "status": this.jsonObj[0][0].Status,
      "code": this.jsonObj[0][0].Code,
      "description": this.jsonObj[0][0].Description,
      "IsPresentByDefault": this.jsonObj[0][0].IsPresentByDefault,
      "IsDailyPunchinRequired": this.jsonObj[0][0].IsDailyPunchinRequired,
      "IsAllowMultiplePunches": this.jsonObj[0][0].IsAllowMultiplePunches,
      "IsAllowEmployeeToInputMultipleWorkingHours": this.jsonObj[0][0].IsAllowEmployeeToInputMultipleWorkingHours,
      "IsUseDefaultWorkingHoursFromShiftDefinition": this.jsonObj[0][0].IsUseDefaultWorkingHoursFromShiftDefinition,
      "IsTimeCalulationRequiredBsedOnMultiplePunches": this.jsonObj[0][0].IsTimeCalulationRequiredBsedOnMultiplePunches,
      "IsAutoPunchOutEnabled": this.jsonObj[0][0].IsAutoPunchOutEnabled,
      "IsAllowToInputTimeForPunchIn": this.jsonObj[0][0].IsAllowToInputTimeForPunchIn,
      "IsAllowToInputTimeForPunchOut": this.jsonObj[0][0].IsAllowToInputTimeForPunchOut,
      "IsAllowToChangeAutoPunchOutIfAutoPunched": this.jsonObj[0][0].IsAllowToChangeAutoPunchOutIfAutoPunched,
      "IsGeoFenceRequired": this.jsonObj[0][0].IsGeoFenceRequired,
      "IsNetworkRestrictionRequired": this.jsonObj[0][0].IsNetworkRestrictionRequired,
      "IsGeoTaggingRequired": this.jsonObj[0][0].IsGeoTaggingRequired,
      "IsImageCaptureRequiredWhilePunchIn": this.jsonObj[0][0].IsImageCaptureRequiredWhilePunchIn,
      "IsImageCaptureRequiredWhilePunchOut": this.jsonObj[0][0].IsImageCaptureRequiredWhilePunchOut,
      "IsHourBasedAttendanceTypeMarkingRequired": this.jsonObj[0][0].IsHourBasedAttendanceTypeMarkingRequired,
      "IsAllowToPunchOnHoliday": this.jsonObj[0][0].IsAllowToPunchOnHoliday,
      "IsAllowToPunchOnNonPayableDay": this.jsonObj[0][0].IsAllowToPunchOnNonPayableDay,
      "IsAllowToEditInAndOutTimesForPastDays": this.jsonObj[0][0].IsAllowToEditInAndOutTimesForPastDays
    });

  }

}
