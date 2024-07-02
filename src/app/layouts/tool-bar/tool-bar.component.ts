import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
//services
// import { AppService } from '../../_services/service/app.service';
//models

import { LoginSessionDetails } from '../../_services/model/LoginSessionDetails';
import { SessionKeys } from '../../app.config';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  @Output() toggleProvidedProvided = new EventEmitter();
  @Output() toggleRightNavProvided = new EventEmitter();
  opened = false;

  _loginSessionDetails: LoginSessionDetails;
  constructor(
    
    // private appService: AppService, 
    private router: Router) {
    // this._loginSessionDetails = <LoginSessionDetails>JSON.parse(this.appService.getSessionStorage(SessionKeys.LocalSessionDetails));
  }
  toggleleftNav() {
    if (this.opened === true) {
      this.opened = false;
    } else {
      this.opened = true;
    }
    this.toggleProvidedProvided.emit();
  }
  toggleRightNav() {
    this.toggleRightNavProvided.emit();
  }
  onLogout() {
    // this.appService.delSessionStorage(SessionKeys.LocalSessionDetails);
    // this.appService.delSessionStorage(SessionKeys.TokenType);
    // this.appService.delSessionStorage(SessionKeys.AccessToken);
    // this.appService.delSessionStorage(SessionKeys.TokenExpiresIn);
    // this.router.navigate(['login']);
  }
  ngOnInit() {

  }

}
