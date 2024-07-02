import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  indx  = 1;
  constructor() { }

  ngOnInit() {
  }

  downloadFile(){
    let link = document.createElement("a");
    link.download = "ESS_PORTAL_User_Manual_V1.pdf";
    link.href = "assets/file/ESS_PORTAL_User_Manual_V1.pdf";
    link.click();
}
}
