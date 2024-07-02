import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  public title = new BehaviorSubject('Dashboard');
  public remarks = new BehaviorSubject(null);
  public status = new BehaviorSubject(null);
  public presentObject = new BehaviorSubject(null);
  public isNewTransfer = new BehaviorSubject(false);
  public dynamicClientLogo = new BehaviorSubject('logo.png');
  public isRedoOffer = new BehaviorSubject(false);
  public aadhaarDetails = new BehaviorSubject(null);
  public myDefaultClientObject = new BehaviorSubject(null);
  public candidateBasicInformation = new BehaviorSubject(null);
  constructor() { }

  setTitle(title) {

    this.title.next(title);
  }

  getTransactionRemars(remarks) {

    this.remarks.next(remarks);
  }

  checkNewTransfer(isNewTransfer) {
    sessionStorage.setItem('isNewTransfer', JSON.stringify(isNewTransfer));
    this.isNewTransfer.next(isNewTransfer);
  }

  setCandidateDetailsForAadhaar(aadhaarDetails) {
    this.aadhaarDetails.next(aadhaarDetails);
  }
  setDefaultClientObject(myDefaultClientObject) {
    this.myDefaultClientObject.next(myDefaultClientObject);
  }
  setCandidateBasicInformation(candidateBasicInformation) {
    this.candidateBasicInformation.next(candidateBasicInformation);
  }

  getOnboardingStatus(status) {
    this.status.next(status);
  }
  getCandidatePresentObject(obj) {
    this.presentObject.next(obj);
  }

  doCheckRedoOffer(isRedoOffer) {
    this.isRedoOffer.next(isRedoOffer);
  }

  checkdynamicClientLogo(dynamicClientLogo) {
    sessionStorage.setItem('dynamicClientLogo', JSON.stringify(dynamicClientLogo));
    this.dynamicClientLogo.next(dynamicClientLogo);
  }
}
