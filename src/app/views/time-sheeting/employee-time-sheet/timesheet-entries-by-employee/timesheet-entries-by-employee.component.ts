import { Component, Input, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Label, Color, BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { AlertService, SessionStorage } from 'src/app/_services/service';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CreateActivityByEmployeeComponent } from '../../create-activity-by-employee/create-activity-by-employee.component';

@Component({
  selector: 'app-timesheet-entries-by-employee',
  templateUrl: './timesheet-entries-by-employee.component.html',
  styleUrls: ['./timesheet-entries-by-employee.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TimesheetEntriesByEmployeeComponent implements OnInit {

  @Input() detailsData: any;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  myCanvas: ElementRef;
  @ViewChild('myCanvas') set canvas(content: ElementRef) {
    console.log(content, 'my content')
    if(content) { // initially setter gets called with undefined
      const gradient = content.nativeElement
      .getContext('2d')
      .createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(166, 212, 241, 1)');
    gradient.addColorStop(0.4, 'rgba(172, 223, 255, 0)');
    this.lineChartColors = [
      {
        backgroundColor: gradient,
      },
    ];
        this.myCanvas = content;
    }
  }
  
  activityListLoader: boolean = false;
  showTotalWorkingHrsCard: boolean = false;
  showDonutChart: boolean = false;
  showSelector: boolean = false;
  deletedItems = [];
  // Donut chart
  public doughnutChartLabels: string[] = ['Actual Working Hours', 'Total Working Hours'];
  public doughnutChartDatasets = [{ data: [0, 0] }];
  public doughnutChartColors: Color[] = [{
    backgroundColor: ['#41BF82', '#E9E9E9', '#FFFFF']
  }];

  public doughnutChartType: ChartType = 'doughnut';

  public doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        right: 15,
        left: 5
      }
    },
    legend: {
      position: 'right',
      onClick: (e: { stopPropagation: () => any; }) => e.stopPropagation(),
      labels: {
        fontSize: 10,
        usePointStyle: true,
        // padding: 25
      }
    },
    hover: { mode: null },
    tooltips: {
      enabled: false
    },
    cutoutPercentage: 70
  };
  public donutChartPlugins = [{
    afterDraw(chart: { ctx: any; tooltip: { _data: { labels: string[]; datasets: { data: string[]; }[]; }; }; innerRadius: number; chartArea: { left: any; right: any; top: any; bottom: any; }; }) {
      const ctx = chart.ctx;
      let txt1 = '';
      let value = '0';
      const labelLength = chart.tooltip._data.labels.length;
      const valLength = chart.tooltip._data.datasets[0].data.length; // to get total working hours value
      // to show total working hours in center
      txt1 = chart.tooltip._data.labels[labelLength - 1];
      value = chart.tooltip._data.datasets[0].data[valLength - 1];
      //Get options from the center object in options
      const sidePadding = 60;
      const sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding

      const stringWidth = ctx.measureText(txt1).width;
      const elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      const widthRatio = elementWidth / stringWidth;

      // Pick a new font size so it will not be larger than the height of label.
      const fontSizeToUse = 14;
      ctx.font = fontSizeToUse + 'px Arial';
      ctx.fillStyle = 'black';
      // Draw text in center
      ctx.fillText(value, centerX, centerY - 10);
      var fontSizeToUse1 = 14;
      ctx.font = fontSizeToUse1 + 'px Arial';
      ctx.fillText('hrs', centerX, centerY + 10);
    },
    afterLayout: function (chart: any) {
      chart.legend.legendItems.forEach(
        (label: { index: string | number; text: string; }) => {
          let value = chart.data.datasets[0].data[label.index];

          label.text += ' ' + value;
          return label;
        }
      )
    }
  }];
  // line chart
  public lineChartType: ChartType = 'line';

  public lineChartData = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: '' }
  ];
  //Labels shown on the x-axis
  lineChartLabels: Label[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        right: 5,
        left: 5
      }
    },
    elements: {
      line: {
        borderWidth: 1
      },
      point: {
        radius: 0.5,
        borderWidth: 0.9,
      }
    },
    hover: {
      mode: 'label'
    },
    tooltips: {
      position: 'nearest',
      borderWidth: 1,
      enabled: true,
      intersect: true,
      mode: 'x'
    },
    scales: {
      xAxes: [
        {
          ticks: {
            display: true,
          },
          gridLines: {
            display: false
          },
        }
      ],
      yAxes: [
        {
          display: false,
          ticks: {
            suggestedMin: 0,
            beginAtZero: true
          }
        }
      ],
    }
  };

  // Define colors of chart segments
  lineChartColors: Color[] = [

    { // blue
      backgroundColor: '#ACDFFF',
      borderColor: '#146BA2',
    },
    { // violet
      backgroundColor: '#E6BCF6',
      borderColor: '#9B59B6',
    }
  ];
  lineChartPlugins = [{
    // afterLayout: chart => {
    //   var ctx = chart.chart.ctx;
    //   var xAxis = chart.scales['x-axis-0'];
    //   var gradientStroke = ctx.createLinearGradient(0, 0, 0, 350);
    //   gradientStroke.addColorStop(0, '#ACDFFF');
    //   gradientStroke.addColorStop(1, '#A6D4F1');
    //   var dataset = chart.data.datasets[0];
    //   dataset.colors.forEach((c, i) => {
    //     var stop = 1 / (dataset.colors.length - 1) * i;
    //     gradientStroke.addColorStop(stop, dataset.colors[i]);
    //   });
    //   dataset.backgroundColor = gradientStroke;
    // }
  }];
  public lineChartLegend = false;

  // common
  timesheetForm: FormGroup;
  timeSheetEntryFormArr: FormArray;
  projectsList: any[] = [];
  dateRangeList: any[] = [];
  selectedDateRange: any;
  activityList: any[] = [];
  formattedDateRange: any;
  configurations = [];
  isOpened: boolean = false;
  spinner: boolean = false;
  selectedProjectForLineChart: any;
  projectForLineChartDropdown: any[] = [];

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  RoleCode: any;
  EmployeeId: any;

  timesheetDates = [];
  isCreateActivityNeedToBeShownForEmployee: boolean = false;
  
  modalOption: NgbModalOptions = {};

  activeIndex = 0;

  setActive(index: number) {
    this.activeIndex = index;
  }

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private customSpinner : NgxSpinnerService,
    private timesheetservice: TimesheetService,
    public modalService: NgbModal,
  ) { }


  ngOnInit() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    // console.log('_loginSessionDetails', this._loginSessionDetails);
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.showTotalWorkingHrsCard = false;
    this.customSpinner.show();
    this.spinner = true;
    this.configurations = [];
    this.timesheetservice.getTimesheetConfigurationForAnEmployee(this.EmployeeId).subscribe((result) => {
      if (result.Status && result.Result !== '') {
        console.log('getTimesheetConfigurationForAnEmployee result',);
        this.configurations = JSON.parse(result.Result);
        if (this.configurations && this.configurations.length) {
          this.isCreateActivityNeedToBeShownForEmployee = this.configurations[0].IsActivityCanBeEnteredByEmployee;
          this.doLoadData().then(() => {
            setTimeout(() => {
              this.customSpinner.hide(); 
              this.spinner = false;
            }, 10);
            console.log('COMPLETED !!!');
          });
        }
      }
    }), ((err: any) => {
      this.customSpinner.hide();
      console.log('getTimesheetConfigurationForAnEmployee API ERROR ::', err);
      this.spinner = false;
    });
  }

  onProjectChangeInLineChart(e: any) {
    console.log('ee', e);
    this.setLineChartData();
  }

  onDropdownChangeFn(evt?: any) {
    // clear previous entries
    this.timesheetDates = [];
    this.showDonutChart = true;
    this.showTotalWorkingHrsCard = true;
    const dateRange = this.dateRangeList.find(a => a.id == this.selectedDateRange);
    // get dates
    const selectedData = dateRange.listedDates;
    this.timesheetservice.getProjectsForAnEmployee(this.EmployeeId, dateRange.startDate, dateRange.endDate).subscribe((apiResult) => {
      if (apiResult.Status && apiResult.Result != '') {
        const result = JSON.parse(apiResult.Result);
        this.projectsList = result.reduce((uniqueObjects, obj) => {
          if (!uniqueObjects.some(item => item.Id === obj.Id)) {
            uniqueObjects.push(obj);
          }
          return uniqueObjects;
        }, []);
        this.projectForLineChartDropdown = [...this.projectsList];
        this.selectedProjectForLineChart = this.projectForLineChartDropdown[0].Id;
        selectedData.forEach((el: any) => {
          // const isStartDateInRange = this.projectsList.some(project => {
          //   const projectStartDate = new Date(project.StartDate);
          //   const projectEndDate = new Date(project.EndDate);
          //   return (new Date(el.Tdate) >= projectStartDate && new Date(el.Tdate) <= projectEndDate);
          // });
          let projectsWithinDateRange = [];
          this.projectsList.forEach(project => {
            const startDate = new Date(project.StartDate);
            const endDate = new Date(project.EndDate);
            const currentDate = new Date(el.Tdate);
            if (currentDate >= startDate && currentDate <= endDate) {
              projectsWithinDateRange.push(project);
            }
          });
          console.log('projectsWithinDateRange', projectsWithinDateRange);
          let text = '';
          if (el.IsLeave && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnALeave) {
            text = 'Leave';
          } else if (el.IsLeave && el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
            text = 'Leave | Week Off';
          } else if (el.IsLeave && !el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
            text = 'Leave | Holiday';
          } else if (el.IsLeave && el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
            text = 'Leave | Week Off | Holiday';
          } else if (el.IsHoliday && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnAHoliday) {
            text = 'Holiday';
          } else if (el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnAWeekOff) {
            text = 'WeekOff';
          } else if (el.IsWeekOff && el.IsHoliday) {
            text = 'Holiday | Week Off';
          }
          const tempObj = {
            date: moment(el.Tdate, 'YYYY-MM-DD').format('D MMMM YYYY, ddd'),
            text: text,
            projects: projectsWithinDateRange, // isStartDateInRange ? this.projectsList : [],
            totalHoursForEachRecord: '0.00',
            childProperties: [{
              project: null,
              title: null,
              startTime: null,
              endTime: null,
              breakHrs: 0,
              workingHrs: '0.00',
              notes: '',
              startDateTime: new Date(),
              endDateTime: new Date(),
              isStartTimeExists: false,
              isEndTimeExists: false
            }]
          };
          this.timesheetDates.push(tempObj);
          this.getDonutChartColors(this.projectsList.length);
          this.getWorkingHoursForEachRecord(tempObj);
        });
      } else {
        this.projectsList = [];
        this.showDonutChart = false;
        this.showTotalWorkingHrsCard = false;
        if (apiResult.Status) {
          this.alertService.showWarning('Please map projects for the selected date range !');
        } else {
          this.alertService.showWarning(apiResult.Message);
        }
      }
    },
    (error) => {
      this.projectsList = [];
      this.showDonutChart = false;
      this.showTotalWorkingHrsCard = false;
      this.alertService.showWarning('Error occurred while fetching projects.');
      console.error(error);
    });
  }

  resetChart() {
    this.lineChartData = [];
    this.lineChartLabels = this.timesheetDates.map(obj => moment(obj.date, 'D MMMM YYYY, ddd').format('ddd'))
    this.lineChartData[0].data = Array(this.lineChartLabels.length).fill(0);
    this.doughnutChartLabels = ['Actual Working Hours', 'Total Working Hours'];
    this.doughnutChartDatasets = [{ data: [0, this.configurations[0].DefaultStandardHours] }];
  }

  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    // splitting to avoid error
    let from = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let to = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    let currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Convert to UTC
    from.setUTCHours(0, 0, 0, 0);   
    to.setUTCHours(0, 0, 0, 0);
    date.setUTCHours(0, 0, 0, 0);

    return currentDate >= from && date <= to;
  }

  getDonutChartColors(arrLength: number) {
    const colorsArray: string[] = [];
    const startColor = "#41BF82"; // as per figma
    const endColor = "#E9E9E9";  // as per figma
    colorsArray.push(startColor);
    for (let i = 1; i < arrLength; i++) {
      //16777215 -max hexadecimal value
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      colorsArray.push(randomColor);
    }
    colorsArray.push(endColor);
    this.doughnutChartColors[0].backgroundColor = colorsArray;
    console.log('colors', colorsArray);
  }
  
  getDonutChartColors1(arrLength: number) {
    const startColor = "#41BF82";
    const endColor = "#E9E9E9";
    const numberOfColors = arrLength + 1;
    // Convert hexadecimal colors to RGB values
    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    };
  
    const fromRgb = hexToRgb(startColor);
    const toRgb = hexToRgb(endColor);
  
    // Calculate the step for each color component
    const step = [
      (toRgb[0] - fromRgb[0]) / (numberOfColors - 1),
      (toRgb[1] - fromRgb[1]) / (numberOfColors - 1),
      (toRgb[2] - fromRgb[2]) / (numberOfColors - 1),
    ];
  
    // Generate the array of colors
    const colorsArray = [];
    for (let i = 0; i < numberOfColors; i++) {
      const r = Math.round(fromRgb[0] + step[0] * i);
      const g = Math.round(fromRgb[1] + step[1] * i);
      const b = Math.round(fromRgb[2] + step[2] * i);
      const color = `rgb(${r},${g},${b})`;
      colorsArray.push(color);
    }
    this.doughnutChartColors[0].backgroundColor = colorsArray;
    console.log('colors', this.doughnutChartColors, colorsArray);
  }

  setDonutChartData() {
    // this.configurations[0].DefaultStandardHours = 40;
    // let total_hrs = 0;
    // for (let item of this.timesheetDates) {
    //   for (let child_item of item.childProperties) {
    //     total_hrs += Number(child_item.workingHrs);
    //   }
    // }
    // // change to actual-total
    // this.doughnutChartDatasets[0].data = [Math.round(total_hrs), this.configurations[0].DefaultStandardHours];
    // if (this.chart) {
    //   this.chart.update();
    // }
    
    
    const totalWorkingHoursByProject: { [projectName: string]: number } = {};
    
    for (const entry of this.timesheetDates) {
      for (const child of entry.projects) {
        // entry.childProperties.find((p) => p.project === child.Id)
        const props = entry.childProperties ? entry.childProperties.filter((p) => p.project === child.Id) : [];
        const workingHours = props && props.length ? props.reduce((acc, curr) => Number(acc) + Number(curr.workingHrs), 0)  : 0;
        let projectName = child.Name // Number(workingHours) === 0 ? 'Others' : child.Name;
        if (projectName in totalWorkingHoursByProject) {
          totalWorkingHoursByProject[projectName] += Number(workingHours);
        } else {
          totalWorkingHoursByProject[projectName] = Number(workingHours);
        }
      }
    }
    this.doughnutChartLabels = Object.keys(totalWorkingHoursByProject);
    this.doughnutChartLabels.push('Total Working Hours');

    this.doughnutChartDatasets[0].data = Object.values(totalWorkingHoursByProject);
    this.doughnutChartDatasets[0].data.push(this.configurations[0].DefaultStandardHours);
    
    console.log('workingHrsValue-donut', totalWorkingHoursByProject);
  }

  setLineChartData() {
    if (this.timesheetDates && this.timesheetDates.length) {
      this.lineChartLabels = this.timesheetDates.map(obj => moment(obj.date, 'D MMMM YYYY, ddd').format('ddd'));
      let workingHrsValue = Array(this.lineChartLabels.length).fill(0);
      if (this.selectedProjectForLineChart === 0) {
        this.timesheetDates.forEach(dateEntry => {
          const dateChartData: { data: any[], label: string } = { data: [], label: ''};
          this.lineChartData = [];
          // Iterate through each project for the current date
          dateEntry.projects.forEach(project => {
            workingHrsValue = this.timesheetDates.map(ts => {
              const workingHours = ts.childProperties.reduce((total: number, prop: { workingHrs: string, project: number }) => {
                if (prop.project === project.Id) {
                  return total + parseFloat(prop.workingHrs);
                } else {
                  return total;
                }
              }, 0);
              return workingHours;
            });
           this.lineChartData.push({data: workingHrsValue, label : ''});
          });
          
        });
      } else {
        workingHrsValue = this.timesheetDates.map(ts => {
          const workingHours = ts.childProperties.reduce((total: number, prop: { workingHrs: string, project: number }) => {
            if (prop.project === this.selectedProjectForLineChart) {
              return total + parseFloat(prop.workingHrs);
            } else {
              return total;
            }
          }, 0);
          return workingHours;
        });
        if (this.lineChartData && this.lineChartData.length > 1) {
          this.lineChartData = [];
          this.lineChartData = [{ data: workingHrsValue, label: '' }];
        } else {
          this.lineChartData[0].data = workingHrsValue;
        }
      }
    } else {
      this.lineChartData = [];
      this.lineChartLabels = this.timesheetDates.map(obj => moment(obj.date, 'D MMMM YYYY, ddd').format('ddd'))
      this.lineChartData[0].data = Array(this.lineChartLabels.length).fill(0);
    }

    // if (this.chart) {
    //   this.chart.update();
    // }
  }

  onProjectChange(e: any, item: { date: any; }, index: string | number) {
    console.log(e);
    const idx = this.timesheetDates.findIndex(a => a.date === item.date);
    this.timesheetDates[idx].childProperties[index].title = null;
  }

  onLoadActivityForSelectedProject(projectId: number | string) {
    this.activityList = [];
    this.activityListLoader = true;
    this.timesheetservice.getActivitiesForAProject(projectId).subscribe((result) => {
      console.log('activity', result);
      this.activityListLoader = false;
      if (result.Status && result.Result != '') {
        const apiResult = JSON.parse(result.Result);
        this.activityList = apiResult;
      }
    }), ((err: any) => {
      this.activityListLoader = false;
      this.activityList = [];
    });
  }

  removeSelectedEntry(item: any, i: number) {
    const idx = this.timesheetDates.findIndex(a => a.date === item.date);

    if (idx !== -1) {
      // Create a reference to the childProperties array
      const childProperties = this.timesheetDates[idx].childProperties;

      if (i >= 0 && i < childProperties.length) {
        // Use splice to remove the selected entry
      const deletedEntry = childProperties.splice(i, 1)[0];

        // Create a new object with updated childProperties and push it to the deletedItems array
        const tempObj = { ...this.timesheetDates[idx], childProperties: deletedEntry };
        this.deletedItems.push(tempObj);
        // to update total working hours
        this.getWorkingHoursForEachRecord(item);
      }
    }
  }

  addTimeSheetEntry(item: { date: any; }, i: any) {
    const idx = this.timesheetDates.findIndex(a => a.date === item.date);
    this.timesheetDates[idx].childProperties.push({
      id: 0,
      project: null,
      title: null,
      startTime: null,
      endTime: null,
      breakHrs: 0,
      workingHrs: '0.00',
      notes: '',
      startDateTime: new Date(),
      endDateTime: new Date(),
      isStartTimeExists: false,
      isEndTimeExists: false
    });
  }

  getWorkingHoursForEachRecord = (item: { childProperties: any[]; }) => {
    if (Array.isArray(item.childProperties) && item.childProperties.length > 0) {
      const hasProjectOrWorkingHrs = item.childProperties.some(child => child.project != null || (child.workingHrs != null && Number(child.workingHrs) !== 0 ));
      if (hasProjectOrWorkingHrs) {
        let total_hrs = item.childProperties.reduce((acc: any, curr: { workingHrs: any; }) => Number(acc) + Number(curr.workingHrs), 0);
        item['totalHoursForEachRecord'] = total_hrs.toFixed(2);
        this.setDonutChartData();
        this.setLineChartData();
      } else {
        item['totalHoursForEachRecord'] = 0;
        this.setDonutChartData();
        this.setLineChartData();
      }
    } 
  }

  getTotalWorkingHoursInCard() {
    // console.log('********', this.timesheetDates);
    let totalWorkingHours = 0;
    if (this.timesheetDates && this.timesheetDates.length) {
      for (const dateEntry of this.timesheetDates) {
        for (const childProperty of dateEntry.childProperties) {
          totalWorkingHours += parseFloat(childProperty.workingHrs);
        }
      }
    }
    return totalWorkingHours;
  }

  doLoadData() {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      if (this.detailsData == undefined) {
        this.loadDataForTimesheetEntriesTab().then(() => {
          if (this.detailsData && this.detailsData.TimesheetDetail && this.detailsData.TimesheetDetail.length) {
            this.showDonutChart = true;
            this.detailsData.TimesheetDetail.forEach((el: any) => {
              // const isStartDateInRange = this.projectsList.some(project => {
              //   const projectStartDate = new Date(project.StartDate);
              //   const projectEndDate = new Date(project.EndDate);
              //   return (new Date(el.TransactionDate) >= projectStartDate && new Date(el.TransactionDate) <= projectEndDate);
              // });

              let projectsWithinDateRange = [];
              this.projectsList.forEach(project => {
                const startDate = new Date(project.StartDate);
                const endDate = new Date(project.EndDate);
                const currentDate = new Date(el.TransactionDate);
                if (currentDate >= startDate && currentDate <= endDate) {
                  projectsWithinDateRange.push(project);
                }
              });
  
              let tempObj: any = {
                date: moment(el.TransactionDate, 'YYYY-MM-DD').format('D MMMM YYYY, ddd'),
                projects: projectsWithinDateRange, // isStartDateInRange ? this.projectsList : [],
                text: '',
                totalHoursForEachRecord: el.WorkingHours,
                childProperties: [{
                  id: el.Id,
                  project: el.ProjectId,
                  title: el.ActivityId,
                  startTime: el.StartTime,
                  endTime: el.EndTime,
                  breakHrs: el.BreakTime,
                  workingHrs: el.WorkingHours,
                  notes: el.EmployeeRemarks,
                  isStartTimeExists: false,
                  isEndTimeExists: false
                }]
              };

              if (el.IsLeave && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave';
              } else if (el.IsLeave && el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave | Week Off';
              } else if (el.IsLeave && !el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave | Holiday';
              } else if (el.IsLeave && el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave | Week Off | Holiday';
              } else if (el.IsHoliday && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnAHoliday) {
                tempObj.text = 'Holiday';
              } else if (el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnAWeekOff) {
                tempObj.text = 'WeekOff';
              } else if ((el.IsWeekOff && el.IsHoliday)) {
                tempObj.text = 'Holiday | Week Off';
              }
  
              const existingDate = this.timesheetDates.find(obj => obj.date === tempObj.date);
              if (existingDate) {
                // Date already exists, push the new child property into the existing object's childProperties array
                existingDate.childProperties.push(tempObj.childProperties[0]);
                this.getWorkingHoursForEachRecord(existingDate);
              } else {
                // Date doesn't exist, create a new tempObj and push it to this.timesheetDates array
                this.timesheetDates.push(tempObj);
              }
              
              this.getWorkingHoursForEachRecord(tempObj);
            });
  
          } else {
            this.showDonutChart = false;
            this.showSelector = false;
            this.showTotalWorkingHrsCard = false;
            if (this.dateRangeList && this.dateRangeList.length > 0) {
              this.showSelector = true;
              this.showDonutChart = true;
              this.selectedDateRange = this.dateRangeList[0].id;
              this.onDropdownChangeFn();
            } 
          }
          resolve(true);
        });
      } else {
        this.getProjectForEmployee().then(() => {
          if (this.projectsList && this.projectsList.length) {
            this.projectsList.forEach(element => {
              this.onLoadActivityForSelectedProject(element.Id);
            });
         }
          if (this.detailsData && this.detailsData.TimesheetDetail && this.detailsData.TimesheetDetail.length) {
            this.showDonutChart = true;
            // this.projectForLineChartDropdown.unshift({Id: 0, Name: 'All Projects'});
            this.detailsData.TimesheetDetail.forEach((el: any) => {
              // const isStartDateInRange = this.projectsList.some(project => {
              //   const projectStartDate = new Date(project.StartDate);
              //   const projectEndDate = new Date(project.EndDate);
              //   return (new Date(el.TransactionDate) >= projectStartDate && new Date(el.TransactionDate) <= projectEndDate);
              // });

              let projectsWithinDateRange = [];
              this.projectsList.forEach(project => {
                const startDate = new Date(project.StartDate);
                const endDate = new Date(project.EndDate);
                const currentDate = new Date(el.TransactionDate);
                if (currentDate >= startDate && currentDate <= endDate) {
                  projectsWithinDateRange.push(project);
                }
              });
  
              let tempObj: any = {
                date: moment(el.TransactionDate, 'YYYY-MM-DD').format('D MMMM YYYY, ddd'),
                projects: projectsWithinDateRange, //isStartDateInRange ? this.projectsList : [],
                text: '',
                totalHoursForEachRecord: el.WorkingHours,
                childProperties: [{
                  id: el.Id,
                  project: el.ProjectId,
                  title: el.ActivityId,
                  startTime: el.StartTime,
                  endTime: el.EndTime,
                  breakHrs: el.BreakTime,
                  workingHrs: el.WorkingHours,
                  startDateTime: new Date(),
                  endDateTime: new Date(),
                  notes: el.EmployeeRemarks,
                  isStartTimeExists: false,
                  isEndTimeExists: false
                }]
              };
  
              if (el.IsLeave && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave';
              } else if (el.IsLeave && el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave | Week Off';
              } else if (el.IsLeave && !el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave | Holiday';
              } else if (el.IsLeave && el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                tempObj.text = 'Leave | Week Off | Holiday';
              } else if (el.IsHoliday && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnAHoliday) {
                tempObj.text = 'Holiday';
              } else if (el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnAWeekOff) {
                tempObj.text = 'WeekOff';
              } else if ((el.IsWeekOff && el.IsHoliday)) {
                tempObj.text = 'Holiday | Week Off';
              }
  
              const existingDate = this.timesheetDates.find(obj => obj.date === tempObj.date);
              if (existingDate) {
                // Date already exists, push the new child property into the existing object's childProperties array
                existingDate.childProperties.push(tempObj.childProperties[0]);
                this.getWorkingHoursForEachRecord(existingDate);
              } else {
                // Date doesn't exist, create a new tempObj and push it to this.timesheetDates array
                this.timesheetDates.push(tempObj);
              }
              this.getWorkingHoursForEachRecord(tempObj);
            });
          } else {
            this.showDonutChart = true;
            this.showSelector = false;
          }
          if (this.detailsData && this.detailsData.TimesheetDates && this.detailsData.TimesheetDates.length) {
            this.detailsData.TimesheetDates.forEach((el: any) => {
              const hasSameDate = this.compareArraysByDate(this.detailsData.TimesheetDetail, el.Tdate);
              if (!hasSameDate) {
                // const isStartDateInRange = this.projectsList.some(project => {
                //   const projectStartDate = new Date(project.StartDate);
                //   const projectEndDate = new Date(project.EndDate);
                //   return (new Date(el.Tdate) >= projectStartDate && new Date(el.Tdate) <= projectEndDate);
                // });
                let projectsWithinDateRange = [];
                this.projectsList.forEach(project => {
                  const startDate = new Date(project.StartDate);
                  const endDate = new Date(project.EndDate);
                  const currentDate = new Date(el.Tdate);
                  if (currentDate >= startDate && currentDate <= endDate) {
                    projectsWithinDateRange.push(project);
                  }
                });
                let text = '';
                if (el.IsLeave && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnALeave) {
                  text = 'Leave';
                } else if (el.IsLeave && el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                  text = 'Leave | Week Off';
                } else if (el.IsLeave && !el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                  text = 'Leave | Holiday';
                } else if (el.IsLeave && el.IsWeekOff && el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnALeave) {
                  text = 'Leave | Week Off | Holiday';
                } else if (el.IsHoliday && !el.IsWeekOff && this.configurations[0].IsTSEntryAllowedOnAHoliday) {
                  text = 'Holiday';
                } else if (el.IsWeekOff && !el.IsHoliday && this.configurations[0].IsTSEntryAllowedOnAWeekOff) {
                  text = 'WeekOff';
                } else if ((el.IsWeekOff && el.IsHoliday)) {
                  text = 'Holiday | Week Off';
                }
      
                const tempObj = {
                  date: moment(el.Tdate, 'YYYY-MM-DD').format('D MMMM YYYY, ddd'),
                  text: text,
                  projects: projectsWithinDateRange, // isStartDateInRange ? this.projectsList : [],
                  totalHoursForEachRecord: '0.00',
                  childProperties: [{
                    project: null,
                    title: null,
                    startTime: null,
                    endTime: null,
                    breakHrs: 0,
                    workingHrs: '0.00',
                    notes: '',
                    startDateTime: new Date(),
                    endDateTime: new Date(),
                    isStartTimeExists: false,
                    isEndTimeExists: false
                  }]
                };
                this.timesheetDates.push(tempObj);
                this.getWorkingHoursForEachRecord(tempObj);
              }
            });
          }
          resolve(true);
        });
      }
    });

    return promise;
  }

  loadDataForTimesheetEntriesTab() {
    const promise = new Promise((resolve, reject) => {
      this.timesheetservice.getPendingTimesheetsForEmployee(this.EmployeeId).subscribe((result) => {
        console.log('getPendingTimesheetsForEmployee result', result);
        if (result.Status && result.Result != '') {
          const data = JSON.parse(result.Result);
          if (data && data.length) {
            data.forEach((e: { StartDate: moment.MomentInput; EndDate: moment.MomentInput; Id: any; Dates: any; }) => {
              const startDate = moment(e.StartDate);
              const endDate = moment(e.EndDate);
              const tempObj = {
                date: `${startDate.format('D MMM YYYY')} - ${endDate.format('D MMM YYYY')}`,
                id: e.Id,
                startDate: e.StartDate,
                endDate: e.EndDate,
                listedDates: e.Dates
              }
              this.dateRangeList.push(tempObj);
            });
            this.selectedDateRange = this.dateRangeList[0].id;
            const startDate = this.dateRangeList[0].startDate;
            const endDate = this.dateRangeList[0].endDate;
            this.timesheetservice.getProjectsForAnEmployee(this.EmployeeId, startDate, endDate).subscribe((apiResult) => {
              if (apiResult.Status && apiResult.Result != '') {
                const result = JSON.parse(apiResult.Result);
                this.projectsList = result.reduce((uniqueObjects: any[], obj: { Id: any; }) => {
                  if (!uniqueObjects.some((item: { Id: any; }) => item.Id === obj.Id)) {
                    uniqueObjects.push(obj);
                  }
                  return uniqueObjects;
                }, []);
                this.getDonutChartColors(this.projectsList.length);
                this.projectForLineChartDropdown = [...this.projectsList];
                this.selectedProjectForLineChart = this.projectForLineChartDropdown[0].Id;
                resolve(true);
              } else {
                this.projectsList = [];
                this.showDonutChart = false;
                this.showTotalWorkingHrsCard = false;
                apiResult.Status ? this.alertService.showWarning('Please map projects for the selected date range !') : this.alertService.showWarning(apiResult.Message);
                resolve(true);
              }
            });
          }
        } else {
          this.projectsList = [];
          this.showDonutChart = false;
          this.showTotalWorkingHrsCard = false;
          result.Status ? this.alertService.showSuccess('No Pending Timesheets !') : this.alertService.showWarning(result.Message);
          resolve(true);
        }
      }), ((err: any) => {
        this.spinner = false;
        this.showDonutChart = false;
        this.showTotalWorkingHrsCard = false;
        console.log('getPendingTimesheetsForEmployee API ERROR ::', err);
      });
    });
    return promise;
  }

  getProjectForEmployee() {
    const promise = new Promise((resolve, reject) => {
      this.projectsList = [];
      if (this.detailsData && Object.keys(this.detailsData).length > 0) {
        const startDate =  this.detailsData.PeriodFrom;
        const endDate = this.detailsData.PeriodTo;
        this.timesheetservice.getProjectsForAnEmployee(this.EmployeeId, startDate, endDate).subscribe((apiResult) => {
          if (apiResult.Status && apiResult.Result != '') {
            const result = JSON.parse(apiResult.Result);
            this.projectsList = result.reduce((uniqueObjects: any[], obj: { Id: any; }) => {
              if (!uniqueObjects.some((item: { Id: any; }) => item.Id === obj.Id)) {
                uniqueObjects.push(obj);
              }
              return uniqueObjects;
            }, []);
            this.getDonutChartColors(this.projectsList.length);
            this.projectForLineChartDropdown = [...this.projectsList];
            this.selectedProjectForLineChart = this.projectForLineChartDropdown[0].Id; // 0;
            resolve(true);
          } else {
            this.projectsList = [];
            this.showDonutChart = false;
            this.showTotalWorkingHrsCard = false;
            apiResult.Status ? this.alertService.showWarning('Please map projects for the selected date range !') : this.alertService.showWarning(apiResult.Message);
            resolve(true);
          }
        });
      }
    });
    return promise;
  }

  compareArraysByDate(arr: any[], date: any) {
    const filteredArr = arr.filter((obj: { TransactionDate: any; }) => obj.TransactionDate === date);
  
    return filteredArr.length > 0;
  }

  onChangeStartTime(event: any, item: any, index: string | number) {
    console.log('start time', event, index);
    const idx = this.timesheetDates.findIndex(a => a.date === item.date);
    this.timesheetDates[idx].childProperties[index].startTime = event.target.value;
    this.timesheetDates[idx].childProperties[index].isStartTimeExists = false;
    if ( this.timesheetDates[idx].childProperties &&  this.timesheetDates[idx].childProperties.length > 1) {
      this.timesheetDates[idx].childProperties[index].isStartTimeExists = this.checkTimeRange(this.timesheetDates[idx].childProperties);
    }
    this.calculateWorkingHours(this.timesheetDates[idx].childProperties[index]);
    this.getWorkingHoursForEachRecord(item);
  }

  onChangeEndTime(event: any, item: any, index: string | number) {
    console.log('end time', event, index);
    const idx = this.timesheetDates.findIndex(a => a.date === item.date);
    this.timesheetDates[idx].childProperties[index].endTime = event.target.value;
    this.timesheetDates[idx].childProperties[index].isEndTimeExists = false;
    if ( this.timesheetDates[idx].childProperties &&  this.timesheetDates[idx].childProperties.length > 1) {
      this.timesheetDates[idx].childProperties[index].isEndTimeExists = this.checkTimeRange(this.timesheetDates[idx].childProperties);
    }
    this.calculateWorkingHours(this.timesheetDates[idx].childProperties[index]);
    this.getWorkingHoursForEachRecord(item);
  }

  onBreakHrsChangeFn(e: any, item: any, index: string | number) {
    const idx = this.timesheetDates.findIndex(a => a.date === item.date);
    this.timesheetDates[idx].childProperties[index].breakHrs = e.target.value;
    this.calculateWorkingHours(this.timesheetDates[idx].childProperties[index]);
    this.getWorkingHoursForEachRecord(item);
  }

  calculateWorkingHours(data: any) {
    const breakHours = data['breakHrs'] && data['breakHrs'] !== '' ? data['breakHrs'] : 0;
    const startTime = data['startTime'];
    const endTime = data['endTime'];
    if (startTime && endTime) {
      // Convert start and end times to moment objects
      const startMoment = moment(startTime, 'h:mm A');
      const endMoment = moment(endTime, 'h:mm A');

      // Convert BreakHours from Minutes to Hours
      const breakInMins = moment.duration(parseInt(breakHours) * 60 * 1000).asMinutes();
      const breakInHrs = moment.duration(Number(breakInMins), 'minutes').asHours();
      console.log(breakInHrs);

      // Calculate the number of hours worked
      const hoursWorked = moment.duration(endMoment.diff(startMoment)).asHours();

      // Subtract the break hours from the total hours worked
      const totalHours = hoursWorked - breakInHrs;
      data.workingHrs = totalHours.toFixed(2);
      console.log(`Total hours worked: ${totalHours}`);
    }
  }

  checkTimeRange(data: any) {
    // sort the data for better performance when large data is being used
    const sortedData = [...data].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  
    let overlap = false;
    for (let i = 0; i < sortedData.length - 1; i++) {
      const range1 = sortedData[i];
      const range2 = sortedData[i + 1];
  
      if (range1.endTime >= range2.startTime) {
        range1.isEndTimeExists = true;
        range2.isStartTimeExists = true;
        overlap = true;
      } else {
        range1.isEndTimeExists = false;
        range2.isStartTimeExists = false;
        overlap = false;
      }
    }
    // console.log('overlap', sortedData);
    return overlap;
  }

  addNewActivityByEmployee(item: any, index: string | number) {
    const modalRef = this.modalService.open(CreateActivityByEmployeeComponent, this.modalOption);
    modalRef.componentInstance.data = item;
    modalRef.result.then((result) => {
      console.log(result);
      if (result !== 'Modal Closed') {
        const idx = this.timesheetDates.findIndex(a => a.date === item.date);
        if (Number(this.timesheetDates[idx].childProperties[index].project) === Number(result.ProjectId)) {
          this.onLoadActivityForSelectedProject(result.ProjectId);
          this.timesheetDates[idx].childProperties[index].title = result.Id;
        }
      }
    }).catch((error) => {
      console.log('ACTIVITY MODAL ERR', error);
    }); 
  }

  // ngAfterViewInit() {
  //   if (this.chart) {
  //     this.chart.update();
  //   }
  // }

}
