import { E } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
@Component({
  selector: 'app-week-off-config-listing',
  templateUrl: './week-off-config-listing.component.html',
  styleUrls: ['./week-off-config-listing.component.css']
})
export class WeekOffConfigListingComponent implements OnInit {
  LstEmployeeRequests: any = []
  effectiveId: any = 1;
  selectAll: any;
  weekOffForm: FormGroup;
  _effectiveDate: any
  weekOffData: any;
  selectWeekOffDays = [];
  weekList = [{
    id : 0,
    name: 'SATURDAY'
  }, {
    id : 1,
    name: 'SUNDAY'
  }, {
    id : 2,
    name: 'MONDAY'
  }, {
    id : 3,
    name: 'TUESDAY'
  }, {
    id : 4,
    name: 'WEDNESDAY'
  }, {
    id : 5,
    name: 'THURSDAY'
  }, {
    id : 6,
    name: 'FRIDAY'
  }]
  EmployeesList = [];
  dummyEmployeesList = [{
    id:1,
    code:18567,
    value:"John Allen",
    empcode:18567,
    effectiveDate: "21/05/2022",
    weekOffDaysId: '1',
    weekOffDays: "Sunday, Saturday",
    isOverride: true, isSelected: false
  },
  {
    id:2,
    code:"14389",
    value:"Harvey Fisher",
    empcode:14389,
    effectiveDate: "21/05/2022",
    weekOffDaysId: '1',
    weekOffDays: "Sunday, Saturday",
    isOverride: true, isSelected: false

  },
  {
    id:3,
    code:"11529",
    value:"Dan Gordon",
    empcode:11529,
    weekOffDaysId: '2',
    effectiveDate: "21/05/2022",
    weekOffDays: "Sunday, Monday",
    isOverride: true, isSelected: false
  },
  {
    id:4,
    code:"12735",
    value:"Mike Norman",
    empcode:12735,
    weekOffDaysId: '2',
    effectiveDate: "21/05/2022",
    weekOffDays: "Sunday, Monday",
    isOverride: true, isSelected: false
  },
  {
    id:5,
    code:"15107",
    value:"Anna Smith",
    empcode:15107,
    weekOffDaysId: '3',
    effectiveDate: "21/05/2022",
    weekOffDays: "Friday, Saturday",
    isOverride: true, isSelected: false
  },
  {
    id:6,
    code:"12846",
    value:"John Williams",
    empcode:12846,
    weekOffDaysId: '3',
    effectiveDate: "21/05/2022",
    weekOffDays: "Friday, Saturday",
    isOverride: true, isSelected: false
  }];

  effectiveType = [
    {
      id: 1,
      value: "Currently Effective"
    },
    {
      id: 2,
      value: "Past Effective"
    },
    {
      id: 3,
      value: "Future Effective"
    }
  ]
  teams:any=[{
    id:1,
    value:"Team1"
  },
  {
    id:2,
    value:"Team2"
  },
  {
    id:3,
    value:"Team3"
  },
  {
    id:4,
    value:"Team4"
  },
  {
    id:5,
    value:"Team5"
  }];
  locations:any=[{
    id:1,
    value:"Panama City"
  },
  {
    id:2,
    value:"Santiago"
  },
  {
    id:3,
    value:"Puerto Armuelles"
  },
  {
    id:4,
    value:"La Chorrera"
  },  {
    id:5,
    value:"Aguadulce"
  }];
  employeeSearchElement: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingScreenService : LoadingScreenService
  ) { }


  ngOnInit() {
    this.loadingScreenService.startLoading();
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedOdx = atob(params["Typ"])
        // var encodedFdx=atob(params['Idx']);
         let data= encodedOdx;
         if(data){
          this.EmployeesList = this.dummyEmployeesList.filter(x => x.weekOffDaysId == data);
         }
         
      } 
    });
    for (let item of this.EmployeesList) {
      item['isSelect'] = false
    }
    this.loadingScreenService.stopLoading();
  }
  onChangeType(event) {
    
  }
  selectAllEmloyees(event: any) {

    // this.LstExpenseBillRequests = [];
    this.EmployeesList.forEach(e => {
      event.target.checked == true ? e.isSelected = true : e.isSelected = false
    });
    if (event.target.checked) {
      this.EmployeesList.forEach(e => {
        this.LstEmployeeRequests.push(e);
      });
    } else {
      this.LstEmployeeRequests = [];
    }
  }

  onTeamChange(e) {

  }

  clickOnSearch() {

  }

  selectListRecords(data, isSelected) {

  }
  onChangeWeek(evt) {
    this.selectWeekOffDays = [];
    if (evt && evt.length) {
      this.selectWeekOffDays = evt.map((item) => item['name']);
    }
    console.log('e', evt, this.selectWeekOffDays);
  }

  onChangeEffectiveDate(e) {

  }

  submitWeekOff() {
    $('#weekoffchangepopup').modal('hide');
    this.router.navigate(['app/masters/weekOffListing']);
  }

  clickonCheckWeekOff() {
    console.log("weekoffchange");
    $('#weekoffchangepopup').modal('show');
    // this.router.navigate(['app/masters/weekoffconfig'], {
    //   queryParams: {
    //     "Idx": btoa("text"),

    //   }
    // });

  }
}
