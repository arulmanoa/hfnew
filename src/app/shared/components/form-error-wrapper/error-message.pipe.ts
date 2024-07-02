import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'format_error',
})
export class ErrorMessageFormatter implements PipeTransform {
  transform(errorName: string, field: string, error: any, errorMessages: any): string {
    const errorMessage: any =
      ERROR_MESSAGES[errorName] || (errorMessages && errorMessages[errorName]);
    return (
      (typeof errorMessage == 'function'
        ? errorMessage.call(null, error)
        : errorMessage) || DEFAULT_ERROR_MESSAGE
    ).replace(/{{field}}/, field);
  }
}

export const ERROR_MESSAGES: any = {
  required: '{{field}} is a required field.',
  minlength: (error: any) =>
    `{{field}} should be atleast ${error.requiredLength} characters in length.`,
  maxlength: (error: any) =>
    `{{field}} should have maximum ${error.requiredLength} characters in length`,
  email: 'Enter a valid Email ID.',
  passwordMismatch: 'Passwords do not match',
  passwordRuleBreak:
    '{{field}} must contain one lower & uppercase letter, and one non-alpha character (a number or a symbol.)',
  invalidMobileNumber: 'Please enter a valid 10 digit mobile number',
  onlyNumbers: 'Only numbers are allowed',
  decimal: '{{field}} must be decimal',
  minVal: (error: any) => `{{field}} must be greater than ${error.minVal}`,
  maxVal: (error: any) => `{{field}} must be less than ${error.maxVal}`,
  onlyAlphabets: 'Only alphabets are allowed',
  blank: `{{field}} can't be blank`,
  differentPassword: 'New Password must not be same as old password',
  alphaNumeric: 'Special characters not allowed.',
  invalidOTPNumber: 'Please enter a valid OTP',
  emailDomain: `Entered email domain is not part of selected organisation. Please verify`,
};

export const DEFAULT_ERROR_MESSAGE = '{{field}} has invalid data.';
