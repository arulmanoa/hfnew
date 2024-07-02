import { Component, OnInit, } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'; 
import { AuthenticationService } from '../_services/service/authentication.service';
import { EncrDecrService } from '../_services/service/encr-decr.service';
@Component({
  selector: 'app-privatelayout',
  templateUrl: './privatelayout.component.html',
  styleUrls: ['./privatelayout.component.css'],
})
export class PrivatelayoutComponent implements OnInit {
  fullName: string;

  usertype: string = '';
  SearchBy: string = '';
  constructor(
    private router: Router,
    private _alertService: ToastrService,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService, 
    private EncrDecr: EncrDecrService,
  ) {

  }
  fnusermenu_ViewEdit(id: number) {
    var parent = $('#' + id).parent().parent();
    var sub = $('#' + id).nextAll();
    parent.children('li.open').children('.sub-menu').slideUp(200);
    parent.children('li.open').children('a').children('.arrow').removeClass('open');
    parent.children('li').removeClass('open');
    if (sub.is(":visible")) {
      $('#' + id).find(".arrow").removeClass("open");
      sub.slideUp(200);
    } else {
      $('#' + id).parent().addClass("open");
      $('#' + id).find(".arrow").addClass("open");
      sub.slideDown(200);
    }
  }

  ngOnInit() {

    // //let currentUser = this.authenticationService.currentUserValue;
    // this.fullName = currentUser.FirstName + ' ' + currentUser.LastName;
    // this.usertype = currentUser.UserType;


  }



  logout() {

    this.authenticationService.logout();
    this._alertService.success('You are logged out successfully');
    this.router.navigate(['/Signin']);
  }

  SearchData() {
    this.router.navigate(['/Search', this.SearchBy]);
  }


}
