import { FormControl, FormGroup } from "@angular/forms";
import moment from "moment";

export const sortBy = (key: string, cb: (a?: number, b?: number) => number) => {
  if (!cb) cb = () => 0;
  return (a?: number, b?: number) =>
    a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : cb(a, b);
}

export const sortByDesc = (key: string, cb: (a?: number, b?: number) => number) => {
  if (!cb) cb = () => 0;
  return (b?: number, a?: number) =>
    a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : cb(b, a);
}

export const orderBy = (keys: string[], orders: ('asc' | 'desc')[]) => {
  let cb = () => 0;
  keys.reverse();
  orders.reverse();
  for (const [i, key] of keys.entries()) {
    const order = orders[i];

    if (order === 'asc') cb = sortBy(key, cb);
    else if (order === 'desc') cb = sortByDesc(key, cb);
  }
  return cb;
}

export const capitalizeFirstLetter = (str: string = "") => str.charAt(0).toUpperCase() + str.slice(1);

export enum DataValidatorKey {
  Email = "Email",
  Mobile = "Mobile",
  MobileNumber = "MobileNumber",
  Stipend = "Stipend",
  OnCostInsurance = "OnCostInsurance",
  FixedDeduction = "FixedDeduction",
  AccountNumber = "AccountNumber",
  FatherName = "FatherName",
  Aadhaar = "Aadhaar",
  DOB = "DOB",
  PAN = "PAN"
};

export interface dataValidatorOptions {
  dataType?: string,
  minLength?: number
  maxLength?: number
  dateFormat?: string
};

export const dataValidator = (key: string, data: any, options: dataValidatorOptions = {}) => {
  switch (DataValidatorKey[key]) {
    case 'EmailId': return /^[\w\.-]+@[a-zA-Z\d]+\.[a-zA-Z]{2,}$/.test(data) && (options.minLength && options.maxLength ? lengthChecker(data, options.minLength, options.maxLength) : true) && (validateDataType(data, options.dataType));
    case 'Email': return /^[\w\.-]+@[a-zA-Z\d]+\.[a-zA-Z]{2,}$/.test(data) && (options.minLength && options.maxLength ? lengthChecker(data, options.minLength, options.maxLength) : true) && (validateDataType(data, options.dataType));
    case 'Mobile': return (/^\d{10}$/.test(data)) && (options.minLength && options.maxLength ? lengthChecker(data, options.minLength, options.maxLength) : true) && (validateDataType(data, options.dataType));
    case 'MobileNumber': return (/^\d{10}$/.test(data)) && (options.minLength && options.maxLength ? lengthChecker(data, options.minLength, options.maxLength) : true) && (validateDataType(data, options.dataType));
    case 'Stipend':
      return Number(data.toString().length) > 0 && Number(data) > 0;
    case 'OnCostInsurance':
    case 'FixedDeduction':
      return Number(data.toString().length) > 0 && Number(data) >= 0;
    case 'AccountNumber': return /^\d+$/.test(data);
    case 'FatherName': return /^[a-zA-Z_ ]*$/.test(data);
    case 'Aadhaar': return /^[0-9]{12}$/.test(data);
    case 'PAN': return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data);
    case 'DOB': {
      let date = moment(data, options.dateFormat);
      return date.isValid() && date.format(options.dateFormat) === data;
    };
  }
};

export const lengthChecker = (data: any, minLength: number, maxLength: number): boolean => {
  if (!data.length) return false;
  return data.length >= minLength && data.length <= maxLength;
};

export const validateDataType = (data: any, dataType: string): boolean => {
  switch (dataType) {
    case 'string':
      return typeof data === 'string';
    case 'number':
      return typeof data === 'number';
    case 'boolean':
      return typeof data === 'boolean';
    default:
      return false;
  }
}

export const isObjectEmpty = (obj: any = {}) => {
  if (obj == null || obj == undefined) return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export const isStringsIdentical = (str1: string = "", str2: string = "") => str1.replace(/\s/g, '').toUpperCase().toString() === str2.replace(/\s/g, '').toUpperCase().toString();

export const arrayJoin = (arr: any[], property: any): string => arr.map((obj) => obj[property]).join(', ');
export const isGuid = (stringToTest: string): boolean => {
  if (stringToTest[0] === "{") {
    stringToTest = stringToTest.substring(1, stringToTest.length - 1);
  }
  var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

  return regexGuid.test(stringToTest);
}

export const dateFormatLocalStringAmPm = (row, cell, value, columnDef, dataContext) => {
  if (value) {
    return moment.utc(value).format('DD-MM-YYYY hh:mm:ss');
  } else {
    return "---";
  }
};

export const validateAllFormFields = (formGroup: FormGroup) => {
  Object.keys(formGroup.controls).forEach((field) => {
    const control = formGroup.get(field);
    if (control instanceof FormControl) {
      control.markAsTouched({ onlySelf: true });
    } else if (control instanceof FormGroup) {
      validateAllFormFields(control);
    }
  });
};

export const isZipFile = (documentName : string): boolean => {
  return documentName.split('.').pop().toUpperCase() === "ZIP";
};