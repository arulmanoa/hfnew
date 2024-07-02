import { AppService } from "src/app/components/Service/app.service";
import { SessionStorageService } from "ngx-webstorage";

import { Component, OnInit, Input, ViewEncapsulation } from "@angular/core";
import { NavItem } from "../../../../_services/model/Common/navitem.model";
import * as $ from "jquery";

import { SessionStorage } from '../../../../_services/service/session-storage.service'; // session storage

import { Menus } from '../../../../_services/model/Menus';
import { SessionKeys } from "src/app/_services/configs/app.config";
import { LoginResponses } from "src/app/_services/model";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-menuitemloader",
  templateUrl: "./menuitemloader.component.html",
  styleUrls: ["./menuitemloader.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class MenuitemloaderComponent implements OnInit {
  @Input() MenuItems: NavItem[];
  @Input() isFirstMenu: boolean;
  @Input() isCollapsed: boolean;
  @Input() isClicked: boolean;
  @Input() isDesktopView: boolean;
  menuClass: string;

  _loginSessionDetails: LoginResponses;
  IsRecruiter: boolean = false;
  HYRERedirecTo: string = "";
  HomePage: string = "";
  RoleCode: string = "";
  IsNewWebMenuItems: boolean = false;
  constructor(
    private appService: AppService,
    private sessionService: SessionStorage
  ) {
    this.isClicked = false;
  }

  ngOnInit() {

    console.log('Menu items :', this.MenuItems);


    this.HYRERedirecTo = environment.environment.hasOwnProperty("HYRE") ? environment.environment.HYRE.RedirectTo : "";
    this.HomePage = environment.environment.hasOwnProperty("HYRE") ? environment.environment.HYRE.HomePage : "";

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    // if(this._loginSessionDetails.UIRolesCopy.filter(a=>a.Role.Code == 'Recruiter' || a.Role.Code == 'PayrollOps').length > 0){
    //   this.IsRecruiter = true;
    // }
    let businessType = 0; // Default value

    if (
      this._loginSessionDetails &&
      this._loginSessionDetails.Company &&
      this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping
    ) {
      const mapping = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId === this._loginSessionDetails.Company.Id);

      if (mapping) {
        businessType = mapping.BusinessType;
      }
    }

    this.IsNewWebMenuItems = environment.environment.AllowableBusinessTypesForWebMenuItems.includes(businessType) ? true : false;

    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;

    if (environment.environment.hasOwnProperty("HYRE") && environment.environment.HYRE.IsRequiredToShow == true && environment.environment.HYRE.PermissibleRoles.includes(sessionStorage.getItem('activeRoleCode'))) {
      this.IsRecruiter = true;
    } else {
      this.IsRecruiter = false;
    }

    this.MenuClassBinder();

    $("html").on("click", function () {
      if ($(".x-navigation").hasClass("x-navigation-minimized")) {
        if (
          $(".x-navigation-minimized app-menuitemloader ul").hasClass("testul")
        ) {
          $(".x-navigation-minimized li").removeClass("active");

          var elem: any;
          if ($(".x-navigation").hasClass("x-navigation-minimized")) {
            elem = document.getElementsByClassName("menuItemLoader");
          } else {
            elem = document.getElementsByClassName("x-navigation");
          }




          for (let index = 0; index < elem.length; index++) {
            var element = elem[index].getElementsByTagName("li");
            if (element && element.length > 0) {
              for (let i = 0; i < element.length; i++) {
                var liElement = element[i];
                if ($("li.xn-openable").hasClass("active")) {
                  var ulEment1 = $("li.xn-openable").find("ul.testul");
                  //  if (ulEment1.hasClass("testul") && $("li.xn-openable").hasClass("active")) {
                  //  // $("li.xn-openable active").removeClass("active");

                  // //   ulEment1.removeClass('testul');
                  //   // ulEment1.width(50);
                  //  }

                  var ulParentElement = (ulEment1[0]);
                  var liParentElement = $(ulParentElement).parent('app-menuitemloader').parent('li');
                  if (liParentElement.hasClass('active')) {
                    liParentElement.removeClass('active');
                  }
                }

                // var ulEment = liElement
                //   .children("app-menuitemloader")
                //   .children("ul");
                // if (ulEment.hasClass("testul")) {
                //   ul.addClass("testul");
                //     liElement.classList.remove("active");
                // }
                //liElement.classList.remove("active");
              }
            }
          }
          $(".x-navigation-minimized li app-menuitemloader ul").removeClass(
            "testul"
          );



          // $(".x-navigation-minimized li app-menuitemloader ul").width(220);
          // $(
          //   ".x-navigation.x-navigation-minimized > li li.xn-openable:before"
          // ).css("display", "block");
          // $(
          //   ".x-navigation.x-navigation-minimized > li li.active.xn-openable:before"
          // ).css("display", "block");
          // $(
          //   ".x-navigation.x-navigation-minimized li app-menuitemloader ul.testul>li a .xn-text"
          // ).css("display", "contents");

          var liChild = $('.app-menuitemloader').children("li");
          if (liChild.hasClass("xn-openable active")) {
            liChild.removeClass("active");
          }
        }
      }
    });

    $(".xn-openable").click(function (event) {
      // this.isClicked = true;

      if (event.isDefaultPrevented() == true) {
        return false;
      } else {
        if ($(".x-navigation").hasClass("x-navigation-minimized")) {
          event.stopPropagation();
          event.preventDefault();
          // if(!this.isClicked)
          // {

          var li = $(event.currentTarget);
          li.addClass("active");
          var ul = li.children("app-menuitemloader").children("ul");

          //$('span.xn-text').css({"display":"block"});

          // var spantextelement = ul.children('xn-text');
          // for (var i = 0; i < spantextelement.length; i++){
          //      //(spantextelement[i] as HTMLElement).style.display = 'block';
          //    }

          //    (spantextelement as HTMLElement) .style.display ="block";

          if (
            li.parent("ul") &&
            (li.parent("ul").hasClass("x-navigation-minimized") ||
              li.parent("ul").hasClass("x-navigation"))
          ) {
            var elem: any;
            if (li.parent("ul").hasClass("x-navigation-minimized")) {
              elem = document.getElementsByClassName("x-navigation-minimized");
            } else {
              elem = document.getElementsByClassName("x-navigation");
            }

            for (let index = 0; index < elem.length; index++) {
              var element = elem[index].getElementsByTagName("li");
              if (element && element.length > 0) {
                for (let i = 0; i < element.length; i++) {
                  var liElement = element[i];
                  if ($("li.xn-openable").hasClass("active")) {
                    var ulEment1 = $("li.xn-openable").find("ul");
                    if (ulEment1.hasClass("testul")) {
                      liElement.classList.remove("active");
                    }
                  }

                  // var ulEment = liElement
                  //   .children("app-menuitemloader")
                  //   .children("ul");
                  // if (ulEment.hasClass("testul")) {
                  //   ul.addClass("testul");
                  //     liElement.classList.remove("active");
                  // }
                  //liElement.classList.remove("active");
                }
              }
            }
          }

          ul.addClass("testul");
          ul.width(220);

          $(
            ".x-navigation.x-navigation-minimized > li li.xn-openable:before"
          ).css("display", "block");
          $(
            ".x-navigation.x-navigation-minimized > li li.active.xn-openable:before"
          ).css("display", "block");
          $(
            ".x-navigation.x-navigation-minimized li app-menuitemloader ul.testul>li a .xn-text"
          ).css("display", "contents");
          li.addClass("active");

          var liChild = ul.children("li");
          if (liChild.hasClass("xn-openable")) {
            liChild.removeClass("active");
          }

          // }
        } else {
          event.stopPropagation();
          event.preventDefault();
          var li = $(event.currentTarget);

          if (
            li.children("app-menuitemloader").length > 0 ||
            li.children(".panel").length > 0 ||
            $(this).hasClass("xn-profile")) {
            if (li.hasClass("active")) {
              li.removeClass("active");
              //  li.find("li.active").removeClass("active");
            } else {
              // var elements = document.getElementsByClassName('active');
              // if (elements)
              // {
              //   for (let index = 0; index < elements.length; index++) {
              //     const element = elements[index].classList.remove('active');

              //   }
              // }
              if (
                li.parent("ul") &&
                (li.parent("ul").hasClass("x-navigation-minimized") ||
                  li.parent("ul").hasClass("x-navigation"))
              ) {
                var elem: any;
                if (li.parent("ul").hasClass("x-navigation-minimized")) {
                  elem = document.getElementsByClassName(
                    "x-navigation-minimized"
                  );
                } else {
                  elem = document.getElementsByClassName("x-navigation");
                }

                for (let index = 0; index < elem.length; index++) {
                  var element = elem[index].getElementsByTagName("li");
                  if (element && element.length > 0) {
                    for (let i = 0; i < element.length; i++) {
                      var liElement = element[i];
                      //liElement.classList.remove('active');
                    }
                  }
                }
              }
              li.addClass("active");
            }
          }
        }
      }
    });

    $(".menuItemLoader li").click(function (event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.isDefaultPrevented() == true) {
        return false;
      } else {
        var li = $(event.currentTarget);

        var elem: any;
        if (
          li
            .parent("ul")
            .parent("app-menuitemloader")
            .hasClass("menuItemLoader")
        ) {
          elem = document.getElementsByClassName("menuItemLoader");
        }

        for (let index = 0; index < elem.length; index++) {
          var element = elem[index].getElementsByTagName("li");
          if (element && element.length > 0) {
            for (let i = 0; i < element.length; i++) {
              var liElement = element[i];
              //liElement.classList.remove("active");
            }
          }
        }

        // var lipa = li.children("app-menuitemloader").children("ul").children('li');

        // if (lipa.hasClass("xn-openable active")) {
        //   lipa.removeClass("active");
        //   //  li.find("li.active").removeClass("active");
        // } else {
        li.addClass("active");
        // }
      }
    });


  }

  setsession() {
    this.appService.setSesstionStorage("clicked", true);
  }

  MenuClassBinder() {
    if (this.isFirstMenu == true) {
      if (this.isCollapsed == true) {
        if (this.isDesktopView == true) {
          this.menuClass = "x-navigation x-navigation-minimized";
        } else {
          this.menuClass = "x-navigation ";
        }
      } else {
        this.menuClass = "x-navigation";
        //this.menuClass = "sidenav";
      }
    }

    //  }
  }

  menuClick(items) {
    const pathMapping = {
      "New Request": "/app/onboarding/onboardingList",
      "OnBoarding Request": "/app/onboarding/onboarding_ops"
    };

    sessionStorage.removeItem('previousPath');
    sessionStorage.setItem('previousPath', pathMapping[items.text] || '');

    if (!this.IsNewWebMenuItems) {
      this.sessionService.delSessionStorage("MenuId");
      this.sessionService.setSesstionStorage("MenuId", items.id);
    }
  }

  goToHyre() {
    console.log('sss');
    try {
      let hrspersists = { privacy: this._loginSessionDetails, settings: null, redirectto: this.HomePage };
      delete hrspersists.privacy.UIRolesCopy;
      // localStorage.setItem('hrspersists', JSON.stringify(hrspersists));     
      // sessionStorage.setItem('hrspersists', JSON.stringify(hrspersists));    
      sessionStorage.setItem('Key', this._loginSessionDetails.Key);
      sessionStorage.setItem('CompanyCode', this._loginSessionDetails.Company.Code.toString());
      sessionStorage.setItem('CompanyId', this._loginSessionDetails.Company.Id.toString());
      sessionStorage.setItem('Token', this._loginSessionDetails.Token);
      sessionStorage.setItem('SessionDetail', JSON.stringify(hrspersists.privacy));
      sessionStorage.setItem('Vector', this._loginSessionDetails.Vector);

      window.open(this.HYRERedirecTo, "_self");
    } catch (error) {
      console.log('SESSION STORAGE EXEP :: ', error);

    }

  }

  goToExternalSite(item) {
    console.log('MI :: ', item);

    try {
      let hrspersists = { privacy: this._loginSessionDetails, settings: null, redirectto: this.HomePage };
      delete hrspersists.privacy.UIRolesCopy;
      sessionStorage.setItem('Key', this._loginSessionDetails.Key);
      sessionStorage.setItem('CompanyCode', this._loginSessionDetails.Company.Code.toString());
      sessionStorage.setItem('CompanyId', this._loginSessionDetails.Company.Id.toString());
      sessionStorage.setItem('Token', this._loginSessionDetails.Token);
      sessionStorage.setItem('SessionDetail', JSON.stringify(hrspersists.privacy));
      sessionStorage.setItem('Vector', this._loginSessionDetails.Vector);
      // window.open(this.HYRERedirecTo, "_self");
      window.open(item.route, item.TargetType == 0 ? "_self" : "_blank");
  } catch (error) {
      console.log('SESSION STORAGE EXEP :: ', error);

    }
  }

  gotoSkill2Talent() {
    if (this.RoleCode == 'Employee') {
      window.open("http://hfactor.okrstars.in/solutions/perform/empperformancereviewform", "_blank");
    }
    else if (this.RoleCode == 'Manager') {
      window.open("http://hfactor.okrstars.in/solutions/perform/teamPMS", "_blank");

    }
    else if (this.RoleCode == 'PayrollOps') {
      window.open("http://hfactor.okrstars.in/solutions/admin.do?operation=admindashboard", "_blank");
    }


  }
}
