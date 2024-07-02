import { Injectable, } from '@angular/core';
import { HttpClient, HttpErrorResponse, } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError, } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BadRequest } from './../../common/bad-request';
import { NotFoundError } from './../../common/not-found-error';
import { AppError } from './../../common/app-error';
import { AuthenticationService } from './authentication.service';
// import { Brand, } from '../model/index';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BrandService {
  // lstBrand: Brand[];
  // objBrand: Brand = {} as any;
  // constructor(private httpClient: HttpClient,
  //   private authenticationService: AuthenticationService) { }

  // public search(SearchBy: string, Search: string, IsActive: Boolean): Observable<Brand[]> {
  //   let currentUser = this.authenticationService.currentUserValue;
  //   let CompanyID = currentUser.CompanyID;
  //   return this.httpClient.get<Brand[]>(environment.baseUrl +
  //     `Brand/Search?CompanyID=` + CompanyID + `&SearchBy=` + encodeURIComponent(SearchBy) + `&Search=` + Search + `&IsActive=` + IsActive)
  //     .pipe(catchError(this.handleError));
  // }

  // public searchById(BrandID: number): Observable<Brand> {
  //   let currentUser = this.authenticationService.currentUserValue;
  //   let CompanyID = currentUser.CompanyID;
  //   return this.httpClient.get<Brand>(environment.baseUrl +
  //     `Brand/SearchByID?CompanyID=` + CompanyID + `&BrandID=` + BrandID)
  //     .pipe(catchError(this.handleError));
  // }

  // public exist(BrandID: number, BrandName: string) {
  //   BrandID = isNaN(BrandID) ? 0 : BrandID;
  //   let currentUser = this.authenticationService.currentUserValue;
  //   let CompanyID = currentUser.CompanyID;
  //   return this.httpClient.get<Boolean>(environment.baseUrl +
  //     `Brand/Exist?CompanyID=` + CompanyID + `&BrandName=` + BrandName + `&BrandID=` + BrandID)
  //     .pipe(map(users => {
  //       if (users)
  //         return true;
  //       else
  //         return false;
  //     })
  //     );
  // }

  // public add(objBrand: Brand): Observable<boolean> {
  //   let currentUser = this.authenticationService.currentUserValue;
  //   objBrand.CompanyId = currentUser.CompanyID;
  //   objBrand.LoginId = currentUser.UserId;
  //   return this.httpClient.post<boolean>(environment.baseUrl + `Brand/Create`, objBrand)
  //     .pipe(catchError(this.handleError));
  // }

  // public update(objBrand: Brand): Observable<boolean> {
  //   let currentUser = this.authenticationService.currentUserValue;
  //   objBrand.CompanyId = currentUser.CompanyID;
  //   objBrand.LoginId = currentUser.UserId;
  //   return this.httpClient.post<boolean>(environment.baseUrl + `Brand/Update`, objBrand)
  //     .pipe(catchError(this.handleError));
  // }
  // public delete(BrandID: number): Observable<Boolean> {
  //   let currentUser = this.authenticationService.currentUserValue;
  //   this.objBrand.BrandID = BrandID;
  //   this.objBrand.CompanyId = currentUser.CompanyID;
  //   this.objBrand.LoginId = currentUser.UserId;
  //   return this.httpClient.post<Boolean>(environment.baseUrl + `Brand/Delete`, this.objBrand)
  //     .pipe(catchError(this.handleError));
  // }

  private handleError(error: HttpErrorResponse) {

    if (error.status === 404)
      return throwError(new NotFoundError(error));

    if (error.status === 400)
      return throwError(new BadRequest(error));
    return throwError(new AppError(error));
  }
}
