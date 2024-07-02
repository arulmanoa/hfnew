import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileExistsService {
    constructor(private http: HttpClient) { }

    checkFileExistence(path: string, filename: string) {
      const fileUrl = `assets/${path}${filename}`;

      return this.http
        .get(fileUrl, { responseType: 'text' })
        .pipe(
          catchError((error) => {
            console.error(`File not found: ${filename}`);
            return of(false);  
          })
        );
    }

    // async checkFileExistence(path: string, filename: string): Promise<boolean> {
    //     const fileUrl = `assets/${path}${filename}`;
    //     try {
    //         await this.http.get(fileUrl, { responseType: 'text' }).toPromise();
    //         return true; // File exists
    //     } catch (error) {
    //         return false; // File does not exist
    //     }
    // }
}