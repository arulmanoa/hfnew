import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-success-screen',
  templateUrl: './success-screen.component.html',
  styleUrls: ['./success-screen.component.css']
})
export class SuccessScreenComponent implements OnInit {

  isMobileResolution: boolean;

  isAllenDigital: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }
  private detectScreenSize() {

    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

  ngOnInit() {
  
    this.isAllenDigital = sessionStorage.getItem('isAllenDigital') == 'true' ? true : false;

    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        const clientId = atob(params["Cdx"]);
        this.isAllenDigital = Number(clientId) === 1988 ? true : false;
      }
    });

    // window.addEventListener("beforeunload", function (e) {
    //   var confirmationMessage = "\o/";
    //   console.log("cond");
    //   e.returnValue = confirmationMessage;

    //   // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
    //   return confirmationMessage;              // Gecko, WebKit, Chrome <34
    // });

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });

  }

  closetab() {
    window.close();
  }

}
