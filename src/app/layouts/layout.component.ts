import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DATA } from '@angular/material';
import { ConnectionService } from 'ng-connection-service'
import { AuthenticationService } from '../_services/service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  encapsulation: ViewEncapsulation.None,

})
export class LayoutComponent implements OnInit {
  // loader service

  loading = false;

  // check internet connection

  status = 'ONLINE'; //initializing as online by default
  isConnected = true;

  constructor(
    private router: Router,
    private _snackBar: MatSnackBar,
    private connectionService: ConnectionService,
    private authService : AuthenticationService,
    private cookieService : CookieService
  ) {

    this.router.events.subscribe((event: Event) => {

      if (event instanceof NavigationStart) {

        // Show loading indicator
        this.loading = true;
      }

      if (event instanceof NavigationEnd) {

        // Hide loading indicator
        setTimeout(() => {

          this.loading = false;

        }, 1000);
      }

      if (event instanceof NavigationError) {

        // Hide loading indicator
        this.loading = false;

        // Present error to user
        console.log(event.error);
      }

      if (event instanceof NavigationCancel) {

        // Hide loading indicator
        this.loading = false;

      }

    });


  }

  ngOnInit() {

    this.doCheckInternetConnection();
    if (!sessionStorage.getItem('loginUserId') || sessionStorage.getItem('loginUserId') == null || sessionStorage.getItem('loginUserId') == "") {
      this.router.navigate(['login']);
    }
  }

  logout() {

    // sessionStorage.clear();
    // sessionStorage.clear();
    this.router.navigate(['login']);
    this.authService.logout().subscribe(() => { });
    this.authService.google_signOut();

    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    const loginRoute = (businessType === 1 || businessType === 2) ? `login/${cookieValue}` : 'login';

    this.router.navigate([loginRoute]);
  }


  doCheckInternetConnection() {

    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        // this.status = "ONLINE";
        // this.openSnackBar("Back to Online");
        this._snackBar.dismiss()
      } else {
        // this.status = "OFFLINE"
        this.openSnackBar("Connection Lost. Please check your internet connection");
      }

    });



  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {

      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      data: { message: message, },
      // duration: 10
    });
  }
}


// Snackbar Component inline 

@Component({
  selector: 'snack-bar-component',
  template: `
  <div>
  <div>
  <img class="logo-size" src="../../../assets/Images/triangle.svg" alt=""> 
  <span>{{data.message}}</span>
  </div>
  <div>
  
  </div>
</div>`,
  styles: [`
    
    .logo-size {
      height: 20px;
      width: 20px;
      margin-right: 10px;
      margin-top: -5px;
    }
  `],
})
export class SnackBarComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {

  }

}