import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css']
})
export class PagenotfoundComponent implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private cookieService: CookieService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  backToLogin() {
    if (sessionStorage.getItem('activeRoleId') != null) {
      this.router.navigateByUrl('/app/dashboard');
    } else {
      this.authService.logout().subscribe(() => {});
      this.authService.google_signOut();
  
      const cookieValue = this.cookieService.get('clientCode');
      const businessType = environment.environment.BusinessType;  
      const loginRoute = (businessType === 1 || businessType === 2) ? `login/${cookieValue}` : 'login';
  
      this.router.navigate([loginRoute]);
    }
  }

}
