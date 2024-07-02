import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { capitalizeFirstLetter } from '../utility-methods/utils';

export interface IBreadCrumb {
  label: string;
  url: string;
}

@Component({
  selector: "app-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"]
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbs: IBreadCrumb[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
      this.breadcrumbs.forEach(element => {
        if (element.label == "Home") {
          element.url = "/app/dashboard";
        }
        element.label = capitalizeFirstLetter(element.label);
      });
      // console.log('BREAD CRUMB :::::::::::', this.breadcrumbs);

    })
  }

  /**
   * Recursively build breadcrumb according to activated route.
   * @param route
   * @param url
   * @param breadcrumbs 
   */
  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadCrumb[] = []): IBreadCrumb[] {
    //If no routeConfig is avalailable we are on the root path
    let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.breadcrumb : '';
    let isClickable = route.routeConfig && route.routeConfig.data && route.routeConfig.data.isClickable;
    let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';

    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path.split('/').pop();
    const isDynamicRoute = lastRoutePart.startsWith(':');
    if (isDynamicRoute && !!route.snapshot) {
      const paramName = lastRoutePart.split(":")[1];
      let routeParams = route.snapshot.params[paramName];
      if (route.snapshot.data.isEncrypted) {
        routeParams = atob(routeParams);
      }
      if (path == 'employee/:id' && lastRoutePart == ':id' && label == 'Employee Details') {
        label = sessionStorage.getItem('essEmpName');
      } else {
        path = path.replace(lastRoutePart, routeParams);
        label = routeParams;
      }
    }

    //In the routeConfig the complete path is not available,
    //so we rebuild it each time
    const nextUrl = path ? `${url}/${path}` : url;
    // if(label != ""){
    label = capitalizeFirstLetter(label);
    const breadcrumb: IBreadCrumb = {
      label: label,
      url: nextUrl,
    };

    // Only adding route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];
    if (route.firstChild) {
      //If we are not on our current path yet,
      //there will be more children to look after, to build our breadcumb
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
    // }
    // else 
    // {
    //   return null;
    // }
  }

  getLetterSpace(string) {
    string = string.replace(/([A-Z])/g, ' $1').trim();
    string = capitalizeFirstLetter(string);
    return string;
  }

}