// In your FindField service
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class FindField {
  public idsToRemove() {
    let ids = [
      "CandiCollapse",
      "onBoardingCollapse",
      "OfferCollapse",
      "CommunicationCollapse",
      "AdditionalInfoCollapse",
      "AdditionalOperationalInfoCollapse",
      "ReferenceDetailsCollapse",
      "LanguageKnownInfoCollapse",
      "DocumentCollapse",
      "ApprovalCollapse",
      "FamilyCollapse",
      "BankCollapse",
      "CandiOtherCollapse",
      "ExperienceCollapse",
      "AcademicCollapse",
    ];


    ids.forEach((id) => {
      let element = document.getElementById(id);
      if (element) {
        element.classList.remove("show");
      }
    });
  }
  
  showAccordion(Id) {
    document.getElementById(Id).classList.add("show");
  }
  scrollingField(value) {
    let screenSize = document.documentElement.clientHeight / value;
    window.scrollTo({
      top: screenSize,
      behavior: "smooth",
    });
  }
  public candidateInfoAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("CandiCollapse");
    let selectedValue = [
      "firstName",
      "gender",
      "email",
      "mobile",
      "dateOfBirth",
    ];
    if (selectedValue.includes(value)) {
      this.scrollingField(4);
    } else {
      this.scrollingField(2);
    }
  }
  public comDetailsAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("CommunicationCollapse");
    let selectedValue = [
      "presentCountryName",
      "presentStateName",
      "presentCity",
      "presentPincode",
      "permanentAddressdetails",
      "permanentCountryName",
      "permanentStateName",
      "permanentCity",
      "permanentPincode",
    ];
    if (selectedValue.includes(value)) {
      this.scrollingField(1);
    } else {
      this.scrollingField(3);
    }
  }
  public onbRequestAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("onBoardingCollapse");
    this.scrollingField(2);
  }
  public offerInfoAccordion(value?: any) {
    let offerInfo1 = [
      "location",
      "reportingLocation",
      "industryType",
      "skillCategory",
      "designation",
      "zone",
      "salaryType",
    ];
    let offerInfo2 = [
      "annualSalary",
      "MonthlySalary",
      "paystructure",
      "letterTemplate",
      "expectedDOJ",
      "reportingTime",
      "tenureType",
      "tenureEndate",
      "tenureMonth",
      "insuranceplan",
      "onCostInsuranceAmount",

    ];
    let offerInfo3= [
      "fixedDeductionAmount",
      "Gmc",
      "Gpa",
      "NoticePeriod",
      "ManagerId",
      "ccemail",
      "Remarks",
      "ActualDOJ",
      "TeamId",
      "EffectivePayPeriod",
      "LeaveGroupId",
      "CostCodeId",
      "AppointmentLetterTemplateId",
      "employmentType",
      "PSR Id",
      "District Code",
      "Branch",
      "Primary Distributor",
      "Secondary Distributor",
      "ctc"
    ]
    let findOffer1 = offerInfo1.find((item) => item === value);
    let findOffer2 = offerInfo2.find((item) => item === value);
    let findOffer3 = offerInfo3.find((item) => item === value)
    this.idsToRemove();
    this.showAccordion("OfferCollapse");
    if (findOffer1) {
      this.scrollingField(2);
    } else if (findOffer2) {
      this.scrollingField(1);
    }else if(findOffer3){
      let screenSize = document.documentElement.clientHeight * 1.5;
      window.scrollTo({
        top: screenSize,
        behavior: "smooth",
      });
    }
  }
  public AdditionalInfoAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("AdditionalInfoCollapse");
    this.scrollingField(2);
  }
  public OperationalInfoAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("AdditionalOperationalInfoCollapse");
    this.scrollingField(2);
  }
  public ReferenceDetailsAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("ReferenceDetailsCollapse");
    this.scrollingField(2);
  }
  public LanguageKnownInfoAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("LanguageKnownInfoCollapse");
    this.scrollingField(2);
  }
  public docDetailsAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("DocumentCollapse");
    this.scrollingField(1);
  }
  public clientApproveAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("ApprovalCollapse");
    this.scrollingField(1);
  }
  public familyDetailsAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("FamilyCollapse");
    this.scrollingField(1);
  }
  public bankInfoAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("BankCollapse");
    this.scrollingField(1);
  }
  public candiOtherDetailsAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("CandiOtherCollapse");
    this.scrollingField(1);
  }
  public workExperienceAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("ExperienceCollapse");
    this.scrollingField(1);
  }
  public academicInfoAccordion(value?: any) {
    this.idsToRemove();
    this.showAccordion("AcademicCollapse");
    this.scrollingField(1);
  }
}
