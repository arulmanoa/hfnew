import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularGridInstance } from 'angular-slickgrid';
import { Subject } from 'rxjs';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { AlertService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { NotificationService } from 'src/app/_services/service/notification.service';
import { PageLayout, SearchBarAccordianToggle } from '../../personalised-display/models';

@Component({
  selector: 'app-notification-history',
  templateUrl: './notification-history.component.html',
  styleUrls: ['./notification-history.component.css']
})
export class NotificationHistoryComponent implements OnInit {

  constructor(
    private pageLayoutService : PagelayoutService,
    public sessionService: SessionStorage,
    private loadingScreenService : LoadingScreenService,
    private alertService : AlertService,
    private router : Router,
    private notificationService : NotificationService
  ) { }

  readonly notificationHistoryPageLayoutCode : string = 'notificationHistory';
  
  notificationHistoryPageLayout : PageLayout = null;
  toggleAccordianSubject : Subject<SearchBarAccordianToggle> = new Subject<SearchBarAccordianToggle>();
  dataset : any[] = [];
  selectedItems: any[] = [];
  grid: AngularGridInstance;
  gridObj: any;
  dataViewObj: any;
  spinner : boolean = false;
  messageContent : string = "";


  sessionDetails: LoginResponses;
  BusinessType: any;


  ngOnInit() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;

    this.pageLayoutService.getPageLayout(this.notificationHistoryPageLayoutCode).subscribe(data => {
      console.log(data);
      if(data.Status === true){
        this.notificationHistoryPageLayout = data.dynamicObject;
      }
      else{
        this.notificationHistoryPageLayout = null;
      }
      
      if(this.notificationHistoryPageLayout === undefined || this.notificationHistoryPageLayout === null){
        this.alertService.showWarning("Something went wrong! Please contact support!");
        this.router.navigate(['app/dashboard']);
      }

      if (this.notificationHistoryPageLayout.SearchConfiguration.FillSearchElementsFromLocal) {
        this.pageLayoutService.fillSearchElementFromLocalStorage(this.notificationHistoryPageLayout.SearchConfiguration.SearchElementList);
      }

      if (this.BusinessType !== 3) {
        this.pageLayoutService.fillSearchElementsForSME(this.notificationHistoryPageLayout.SearchConfiguration.SearchElementList);
        console.log("Search Elemets::" , this.notificationHistoryPageLayout.SearchConfiguration.SearchElementList);
      }
    

      this.pageLayoutService.fillSearchElementsForSecurityKeys(this.notificationHistoryPageLayout.SearchConfiguration.SearchElementList);
        
      
    } , error => {
      console.error(error);
    });
  }


  onClickingSearchButton(){

    // this.toggleAccordianSubject.next({Type : AccordianToggleType.hide , ChangeAccordianText : true});
    this.getDataset();
  }

  getDataset(){

    this.spinner = true;
    this.dataset = [];

    this.pageLayoutService.getDataset(this.notificationHistoryPageLayout.GridConfiguration.DataSource ,
      this.notificationHistoryPageLayout.SearchConfiguration.SearchElementList).subscribe(data => {
        this.spinner = false;
        if(data !== undefined && data !== null && data.Status && data.dynamicObject !== ""){
          this.dataset = JSON.parse(data.dynamicObject);
        }
      } , error => {
        this.spinner = false;
        console.error(error);
      })
  }

  onGridCreated(angularGrid : AngularGridInstance){
    this.grid = angularGrid;
    this.gridObj = angularGrid && angularGrid.slickGrid || {};
    this.dataViewObj = angularGrid.dataView;
  }

  onSelectedRowsChanged(event){
    // console.log("Event ::" , event);
    let args = event.detail.args;

    this.selectedItems = [];

    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataViewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('selected ::', this.selectedItems);
  }

  onCellClicked(eventData, args){
    const metadata = this.grid.gridService.getColumnFromEventArguments(args);

    console.log("cell clicked" , metadata);
    
    if (metadata.columnDef.id === 'MessageContent') {

      var messageString = metadata.dataContext.MessageContent;

      if(messageString != undefined && messageString != null && messageString !== ''){
        var messageJson = JSON.parse(messageString);

        if(messageJson !== undefined && messageJson !== null){
          if(metadata.dataContext.Type == "Email"){
            var body = messageJson["Body"]
          }
          else{
            var body = messageString;
          }
        }
      }

      this.messageContent = body;

      $('#notification_message').modal('show');
    }  
  }

  modal_dismiss_notification_message(){
    $('#notification_message').modal('hide');

    
  }

  onClickingReSendButton(){

    
    if(this.selectedItems !== undefined && this.selectedItems !== null && this.selectedItems.length == 0){
      this.alertService.showInfo("Please select atleast one record to send");
      return;
    }

    var notFailedRecords = this.selectedItems.filter(x => x.DisplayStatus != 'Failed');

    if(notFailedRecords !== undefined && notFailedRecords !== null && notFailedRecords.length > 0){
      this.alertService.showInfo("Only failed notifications can be sent again");
      return;
    }

    let notificationIds : number[] = [];

    for(let row of this.selectedItems)  {
      if(row.NotificationId != undefined && row.NotificationId != null && row.NotificationId !== 0){
        notificationIds.push(row.NotificationId);
      }
    }

    this.loadingScreenService.startLoading();
    this.notificationService.PushNotificationMessagesToQueue(notificationIds).subscribe(data => {
      this.loadingScreenService.stopLoading();
      if(data != undefined){
        if(data.Status){
          this.alertService.showSuccess("Sucess");
          this.getDataset();
        }
        else{
          this.alertService.showWarning(data.Message);
        }
      }
      else{
        this.alertService.showWarning("Unknow error occured, please try again");
      }
      

    } , error => {
      console.error(error);
    })

  }
}
