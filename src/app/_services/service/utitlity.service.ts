import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class UtilityService {

    isNull(value: any) {
        return value === null;
    }

    isUndefined(value: any) {
        return typeof value === 'undefined';
    }

    isNullOrUndefined(value: any) {
        return typeof value === 'undefined' || value === null || value === "";
    }

    isNotNullAndUndefined(value: any) {
        return typeof value !== 'undefined' && value !== null;
    }

    isStringEmpty(value: any) {
        return value === '';
    } 

    isObjectEmpty(obj: any) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    isStringHasValue(value: any) {
        return value !== null && typeof value !== 'undefined' && value !== '';
    }

    isObjectHasValue(value: any) {
        return value !== null && typeof value !== 'undefined' && this.isObjectEmpty(value);
    }

    isListHasValue(value: any) {
        return value !== null && typeof value !== 'undefined' && value.length;
    }

    isListNullOrUndefinedOrNoRcrd(value: any) {
        return typeof value === 'undefined' || value === null || !value.length;
    }

    getAge(d1: Date, d2: Date): number {
        d2 = d2 || new Date();
        var diff = d2.getTime() - d1.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    isDateInvalid(date: any) {
        return this.isNullOrUndefined(date) || date === "0001-01-01T00:00:00";
    }

    isProperDate(obj: any) {
        return obj !== null && !this.isDateInvalid(obj.date);
    }

    getFormattedDate(date: any) {
        if (this.isNullOrUndefined(date) || date === "0001-01-01T00:00:00") {
            return "";
        }
        var datePipe = new DatePipe("en-US");
        return datePipe.transform(date, 'dd/MM/yyyy');
    }

    convertForDatePicker(conDate: any) {
        let cdate = new Date(conDate);
        let convertDate: Object = { date: { year: cdate.getFullYear(), month: cdate.getMonth() + 1, day: cdate.getDate() } };
        return convertDate;
    }

    convertForObject(conDate: any) {

        return conDate.month + "-" + conDate.day + "-" + conDate.year;
    }

    _keyPress(event: any) {
        const pattern = /^[0-9]*$/;
        const inputChar = String.fromCharCode(event.charCode);
        if (!pattern.test(inputChar)) {
            // invalid character, prevent input
            event.preventDefault();
        }
    }

    doesExistInList(newArray, obj) {
        for (let i = 0; i < newArray.length; i++) {
            if (newArray[i].Id === obj.Id) {
                return true;
            }
        }
        return false;
    }

    ensureIdUniqueness(dataset) {
        const promise = new Promise((resolve, reject) => {
            let isDup = false
            let uniq_values = []
            let duplicateIds = [];

            //iterate the source data
            for (let x of dataset) {
                if (uniq_values.indexOf(x.Id) != -1) {
                    console.log('ACTUAL OBJECT OF DUPLICATE IS :', x);
                    duplicateIds.push(x.Id);
                    isDup = true
                    break
                } else {
                    uniq_values.push(x.Id)
                }
            }
            console.log('Duplicate Ids ::', duplicateIds);
            resolve(isDup);
        })
        return promise;

    }

    formatDate(date: any, format: any) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
    
        switch (format) {
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            case 'MM-DD-YYYY':
                return `${month}-${day}-${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY/MM/DD':
                return `${year}/${month}/${day}`;
            default:
                return `${day}-${month}-${year}`;
        }
    }
}