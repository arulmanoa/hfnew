import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/service';
import { DomSanitizer } from '@angular/platform-browser';

export interface SetupCode {
  Account: string;
  AccountSecretKey: string;
  ManualEntryKey: string;
  QrCodeSetupImageUrl: string;
  new(): SetupCode;

  new(account: string, manualEntryKey: string, qrCodeSetupImageUrl: string): SetupCode;
}

@Component({
  selector: 'app-two-factor-authenticator',
  templateUrl: './two-factor-authenticator.component.html',
  styleUrls: ['./two-factor-authenticator.component.css']
})
export class TwoFactorAuthenticatorComponent implements OnInit {


  email: string;
  secretKey: string;
  qrCode: any;
  twoFactorCode: string;

  constructor(
    private _sanitizer: DomSanitizer,
    private _configService: AuthenticationService,
  ) { }

  ngOnInit() {
  }

  generateSecretKey() {
    this._configService.GenerateQRCode().subscribe((result: any) => {
      let respns: SetupCode = result
      console.log('SetupCode :', respns);
      this.secretKey = respns.ManualEntryKey;
      this.qrCode = this._sanitizer.bypassSecurityTrustResourceUrl(respns.QrCodeSetupImageUrl);

      // this.qrCode = 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=' + encodeURIComponent(respns.QrCodeSetupImageUrl);

    }, (e) => {

    });
    // this.http.get('/api/twofactorauthenticator/generatesecretkey').subscribe((result: any) => {
    //   this.secretKey = result;
    //   this.qrCode = 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=' + encodeURIComponent(result);
    // });
  }

  validateTwoFactorCode() {

    this._configService.VerifyCode(this.twoFactorCode).subscribe((result: any) => {
      console.log('result', result);
    }, (e) => {

    });

  }

}
