import { Component, OnInit } from '@angular/core';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { apiResult } from 'src/app/_services/model/apiResult';
import { NoticeCategory } from 'src/app/_services/model/Common/Widget';
import { AlertService } from 'src/app/_services/service';

@Component({
  selector: 'app-alertpushmessage',
  templateUrl: './alertpushmessage.component.html',
  styleUrls: ['./alertpushmessage.component.css']
})
export class AlertpushmessageComponent implements OnInit {

  userIds: any;
  title: string = "";
  bodyMessage: string = "";
  expiryDate: any;
  category: any;

  lstCategory: any[] = [];

  constructor(
    private alertService: AlertService,
    private enumhelpter: enumHelper
  ) { }

  ngOnInit() {
    this.lstCategory = this.enumhelpter.transform(NoticeCategory) as any;
  }

  onClickNotify() {

    var nums = this.userIds.split(",").map(function (str) {
      return parseInt(str);
    });

    let payload = JSON.stringify({
      UserIds: nums,
      Title: this.title,
      Body: this.bodyMessage,
      Expiry: this.expiryDate,
      Category: this.category
    })

    console.log('payload :', payload);


    this.alertService.TestNotificationCheck(payload).subscribe((data) => {
      let apiR: apiResult = data;
      if(apiR.Status){
        this.alertService.showInfo("Notification is successfully sent");
      }else {
        this.alertService.showInfo(apiR.Message);

      }
    })
  }
}
