import { Component, OnInit } from '@angular/core';
import { EncrDecrService } from "../_services/service/encr-decr.service";
import { SessionStorage } from '../_services/service/session-storage.service'
import { SessionKeys } from '../_services/configs/app.config'; // app config  
import CryptoJS from 'crypto-js';
import { AttendanceService } from '../_services/service/attendnace.service';
import * as XLSX from 'xlsx';
import _ from 'lodash';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {
  methodtype: any = 1;
  inputvalue: any;
  outputvalue: any;
  URL: any;
  outputvalue1: any;
  key; vector; token; output_originalvalue; encryptedText;

  payload: any;
  endpoint: any;
  producertype: any = 3;
  verbType : any = 3
  convertedJSON = [];
  constructor(private encrydecryptService: EncrDecrService,
    private session: SessionStorage, private attendanceService: AttendanceService,) {

  }

  get sessionDetails() {
    return JSON.parse(this.session.getSessionStorage(SessionKeys.LoginResponses));
  }

  ngOnInit() {
  }

  validate() {

    if (this.methodtype == 1) {
      let payload = '"{"newobj":{"jobRequirementAssignmentDetails":[{"JobRequirementId":148,"AssignmentParentId":0,"AssignedTo":3,"AssignedBy":2851,"AssignedOn":"2022-07-26T13:57:16.408Z","TargetNumberOfPositions":2,"TargetClosureDate":"2022-07-26T13:57:16.408Z","IsShareable":true,"Remarks":"string","Status":1,"Id":0}]},"oldobj":{},"customObject1":{},"customObject2":{},"Id":0}"'
      this.outputvalue = this.encrydecryptService.EncryptWithAES(this.sessionDetails, payload)
    }


    if (this.methodtype == 1) {

      let url = new URL(this.URL);


      let pathNames = url.pathname.split('/');

      let apiEndpoints = pathNames.slice(1, 5);

      let params = pathNames.slice(5);
      let encryptedParams: string[] = [];
      for (let param of params) {
        let encryptedParam = this.encrydecryptService.EncryptWithAES(this.sessionDetails, param);
        encryptedParams.push(encryptedParam);
      }

      let newPathName: string = apiEndpoints.join('/');
      newPathName += (encryptedParams.length > 0) ? ("/" + encryptedParams.join('/')) : "";


      let oldSearchParams = url.searchParams;

      let newSearchParams: URLSearchParams = new URLSearchParams();

      oldSearchParams.forEach((value, key) => {
        newSearchParams.append(key, this.encrydecryptService.EncryptWithAES(this.sessionDetails, value));
      })

      let newSearch = newSearchParams.toString();


      var newURL = url.protocol + "//" + url.host + "/" + newPathName;
      newURL += (newSearch !== undefined && newSearch !== null && newSearch !== '') ? ("?" + newSearch) : "";

      this.outputvalue = newURL;

    }
    else {
      console.log('sss');

      console.log('DECRYPTED OUTPUT :: ', this.encrydecryptService.DecryptWithAES(this.sessionDetails, this.inputvalue));

      this.outputvalue1 = (this.encrydecryptService.DecryptWithAES(this.sessionDetails, this.inputvalue));

    }




    // if(this.methodtype == 1){
    //   console.log('enc');
    //  this.outputvalue =   this.encrydecryptService.EncryptWithAES(this.sessionDetails, this.inputvalue)
    // }else {
    //   console.log('dec', this.encrydecryptService.DecryptWithAES(this.sessionDetails, this.inputvalue));

    // this.outputvalue =   this.encrydecryptService.DecryptWithAES(this.sessionDetails, this.inputvalue)
    // }


  }

  button2() {
    var i = this.DecryptWithAES(this.sessionDetails, this.encryptedText);
    console.log('i', i);

  }

  EncryptWithAES(sessionDetails, strToEncrypt: string) {

    const key = this.key
    const vector = this.vector;


    var encrypted;

    try {
      encrypted = CryptoJS.AES.encrypt(strToEncrypt, key, {
        keySize: 128,
        iv: vector,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    }
    catch (ex) {
      encrypted = null;
    }

    let encryptedString: string = encrypted.toString();

    let reForPlus = /\+/g;
    let reForSlash = /\//g;
    let charReplacedEncryptedString: string = encryptedString.replace(reForPlus, "*").replace(reForSlash, "-");

    // console.log("Encrypt -> Decrypt result ::" , this.DecryptWithAES(sessionDetails , encrypted.toString()));

    return charReplacedEncryptedString;

  }


  DecryptWithAES(sessionDetails, strToDecrypt: string) {

    let reForPlus = /\*/g;
    let reForSlash = /\-/g;
    let charReplacedStringToDecrypt: string = strToDecrypt;
    // let charReplacedStringToDecrypt : string = strToDecrypt;
    console.log("str to decrypt ::", charReplacedStringToDecrypt);

    const key = this.key
    const vector = this.vector;

    var decrypted;



    try {
      decrypted = CryptoJS.AES.decrypt(charReplacedStringToDecrypt, key, {
        keySize: 128 / 8,
        iv: vector,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    }
    catch (ex) {
      decrypted = null;
      console.log(ex);
    }

    // console.log("Decrypted ::" , decrypted);

    console.log("Decrypted ::", decrypted.toString(CryptoJS.enc.Utf8));

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

  }

  apiCall() {

    if (this.producertype == '3') {
      var i = this.payload;
      console.log('IIII', i.toString());
      var j = 
    //   {
    //     "newobj": {
    //         "JobRequirement": {
    //             "Id": 0,
    //             "JobTitle": "sample test 56",
    //             "JobCode": "",
    //             "JobDescription": "s",
    //             "DocumentId": 0,
    //             "NumberOfPositions": 2,
    //             "JobCategory": 2,
    //             "KeySkills": "[\"python\"]",
    //             "MinimumExperience": 0,
    //             "MaximumExperience": "10",
    //             "MinimumAnnualCost": "10",
    //             "MaximumAnnualCost": "110",
    //             "EducationalQualification": 11,
    //             "CountryId": 100,
    //             "StateId": 3,
    //             "LocationId": 607,
    //             "WorkLocation": "abcd",
    //             "TargetClosureDate": "2022-11-30T00:00:00+05:30",
    //             "NoticePeriodDays": 24,
    //             "Gender": 1,
    //             "Attribute1": "string",
    //             "Attribute2": "string",
    //             "Attribute3": "string",
    //             "Notes": "",
    //             "ClosureRemarks": "",
    //             "Status": 1
    //         },
    //         "JobRequirementAdditionalDetails": [
    //             {
    //                 "Id": 0,
    //                 "JobRequirementId": 0,
    //                 "HiringRequestId": 0,
    //                 "ClientID": 1950,
    //                 "ContactID": 7,
    //                 "ClientContractID": 384,
    //                 "AccountManagerID": 0,
    //                 "RequirementType": 26,
    //                 "JobType": 7,
    //                 "TargetIndustry": 5,
    //                 "IsFlaggedAsPriority": true,
    //                 "IsExclusive": true,
    //                 "ExclusivityNotes": "",
    //                 "IsShareable": true,
    //                 "IsConfidential": true,
    //                 "AllocateToSelf": false,
    //                 "IsRemoteWorkAllowed": false,
    //                 "IsDirectCallAllowed": false,
    //                 "PublishJob": false,
    //                 "AllowCandidateResponse": 0,
    //                 "AdditionalTags": "",
    //                 "RequirementNotes": "",
    //                 "IsGigWork": true,
    //                 "HourlyRate": 0,
    //                 "Currency": 0,
    //                 "Status": 1
    //             }
    //         ],
    //         "JobClassification": {
    //             "Id": 0,
    //             "JobRequirementId": 0
    //         },
    //         "ClientExpectation": [],
    //         "JobRequirementInterviewLevels": [
    //             {
    //                 "Id": 0,
    //                 "JobRequirementId": 0,
    //                 "InterviewLevelName": "ff",
    //                 "DisplayOrder": 0,
    //                 "Status": 1
    //             }
    //         ]
    //     },
    //     "oldobj": {},
    //     "customObject1": {},
    //     "customObject2": {},
    //     "Id": 0
    // };     
    {
      "newobj": {
        "JobRequirement": {
          "Id": 0,
          "JobTitle": "test bn",
          "JobCode": "",
          "JobDescription": "test bn",
          "DocumentId": 0,
          "NumberOfPositions": "20",
          "KeySkills": "[\"Developer\"]",
          "MinimumExperience": "1",
          "MaximumExperience": "2",
          "MinimumAnnualCost": "1200000",
          "MaximumAnnualCost": "12000052",
          "EducationalQualification": "14",
          "CountryId": 100,
          "StateId": 3,
          "LocationId": 1032,
          "WorkLocation": "Bangalore",
          "TargetClosureDate": "19 Nov 2022",
          "Gender": 1,
          "Notes": "",
          "ClosureRemarks": "",
          "Status": 1
        },
        "JobRequirementAdditionalDetails": [
          {
            "Id": 0,
            "ClientID": 34,
            "ClientContractID": 8,
            "AccountManagerID": 0,
            "RequirementType": 28,
            "IsFlaggedAsPriority": false,
            "IsExclusive": false,
            "ExclusivityNotes": "",
            "IsShareable": false,
            "IsConfidential": true,
            "IsRemoteWorkAllowed": false,
            "IsDirectCallAllowed": false,
            "PublishJob": false,
            "AllowCandidateResponse": 0,
            "AdditionalTags": "",
            "RequirementNotes": "",
            "HourlyRate": 0,
            "Currency": 0,
            "Status": 1
          }
        ],
        "JobClassification": {},
        "ClientExpectation": [],
        "JobRequirementInterviewLevels": []
      },
      "oldobj": {},
      "customObject1": {},
      "customObject2": {},
      "Id": 0
    };
     
  //   var j = {
  //     "ApplicantDetails": {
  //         "FirstName": "QW",
  //         "LastName": "RE",
  //         "DateOfBirth": "2022-11-10T00:00:00+05:30",
  //         "Gender": 1,
  //         "FathersName": "tetet",
  //         "CountryOfOrigin": 100,
  //         "Nationality": 100,
  //         "IsPhysicallyChallenged": false,
  //         "SocialSecurityNumber": "342222222222",
  //         "TaxNumber": "asdfg2323e",
  //         "IsBlacklisted": false,
  //         "Status": 1,
  //         "LstApplicantDocuments": [
  //         ],
  //         "Id": 0
  //     },
  //     "ApplicantAdditionalDetails": {
  //         "ApplicantId": 0,
  //         "ApplicantSource": "",
  //         "ExternalReferenceID": "",
  //         "SocialMediumLink": "https://linke.com",
  //         "OtherLinks": "",
  //         "ApplicantTags": "",
  //         "Attribute1": "",
  //         "Attribute2": "",
  //         "Attribute3": "",
  //         "ApplicantNotes": "sdfasdfa\n",
  //         "Status": 1,
  //         "Id": 0
  //     },
  //     "ApplicantCommunicationDetails": {
  //         "ApplicantId": 0,
  //         "MobileNumber": "4740454545",
  //         "EmailId": "tttteooost@gmail.com",
  //         "AlternateMobileNumber": "",
  //         "AlternateEmailId": "",
  //         "EmergencyContactNumber": "",
  //         "PresentAddress": "sdfa",
  //         "PresentAddressCityId": 270,
  //         "PresentAddressPinCode": "343432",
  //         "PresentAddressStateId": 5,
  //         "PresentAddressCountryId": 100,
  //         "PermanentAddress": "sdfa",
  //         "PermanentAddressCityId": 270,
  //         "PermanentAddressPinCode": "123456",
  //         "PermanentAddressStateId": 5,
  //         "PermanentAddressCountryId": 100,
  //         "Status": 1,
  //         "Id": 0
  //     },
  //     "ApplicantEducationDetails": [
  //         {
  //             "ApplicantId": 0,
  //             "GraduationType": 11,
  //             "EducationDegree": "dsf",
  //             "CourseType": 1,
  //             "InstitutionName": "sdf",
  //             "UniversityName": "sdf",
  //             "YearOfPassing": "2013",
  //             "ScoringType": 1,
  //             "ScoredValue": "3",
  //             "Status": 1,
  //             "LstApplicantDocuments": [
  //                 null
  //             ],
  //             "Id": 0
  //         }
  //     ],
  //     "ApplicantProfessionDetails": [
  //         {
  //             "ApplicantId": 0,
  //             "ProfileTitle": "eafsdf",
  //             "ProfileSummary": "sdafasf",
  //             "IsCurrentCompany": false,
  //             "CompanyName": "sfa",
  //             "Designation": "34",
  //             "JobResponsibilities": "sdfa",
  //             "JobLocation": "sf",
  //             "StartDate": "2022-11-03T00:00:00+05:30",
  //             "EndDate": "2022-11-17T00:00:00+05:30",
  //             "Industry": 6,
  //             "JobType": 6,
  //             "LastDrawnSalary": 0,
  //             "Notes": "",
  //             "Status": 1,
  //             "LstApplicantDocuments": [
  //                 null
  //             ],
  //             "Id": 0
  //         }
  //     ],
  //     "ApplicantSkillDetails": [
  //         {
  //             "ApplicantId": 0,
  //             "SkillName": "dfasd",
  //             "Specialisation": "dfasd",
  //             "YearsOfExperience": "3",
  //             "LastUsedDate": "2022-11-10T00:00:00+05:30",
  //             "Proficiency": "3",
  //             "Status": 1,
  //             "LstApplicantDocuments": [],
  //             "Id": 0
  //         }
  //     ],
  //     "ApplicantExpectationDetails": {
  //         "ApplicantId": 0,
  //         "CurrentCTC": "23333",
  //         "ExpectedCTC": "34999",
  //         "ExpectedEmploymentType": 35,
  //         "ExpectedWorkLocation": "bbt",
  //         "ExpectedDesignation": "teet",
  //         "ExpectedDesignationLevel": "t",
  //         "NoticePeriod": 22,
  //         "PayFrequency": 4,
  //         "PreferredIndustry": 2,
  //         "PreferredJobType": 3,
  //         "ExpectationNotes": "",
  //         "Status": 1,
  //         "LstApplicantDocuments": [],
  //         "Id": 0
  //     },
  //     "ApplicantDocuments": [],
  //     "ApplicantConversationDetails": {}
  // }

  var ja = {
    "OfferNotes": "test for 75",
    "JobRequirementId": 467,
    "JobRequirementStageId": 8,
    "LstRLCOfferDetails": [
        {
            "Id": 246,
            "RLCTransactionId": 250,
            "ApplicantID": 192
        }
    ],
    "ObjectStorageDetails": []
};

      var _api_payload = JSON.stringify(i);
      console.log('payload ::::', _api_payload);
      console.log('endpoint ::::', this.endpoint);

      if(this.verbType == 3){
        this.attendanceService.callAPIPUT(this.endpoint, i).subscribe((r) => {
          console.log(r);
        })
      }
      else{
        this.attendanceService.callAPIPOST(this.endpoint, i).subscribe((r) => {
          console.log(r);
        })
      }
      
    }else  if (this.producertype == '2' || this.producertype == '1') {
      console.log('payload ::::', this.payload);
      console.log('endpoint ::::', this.endpoint);

      this.attendanceService.calAPIGET(this.endpoint, this.payload).subscribe((r) => {
        console.log(r);

      })
    }
    
  }

  async onbrowseFile(e) {
    const file = e.target.files[0];
  
    await this.upload_file(e);
  
  }

  
  upload_file(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary', cellDates: true });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, { raw: false });
        return initial;
      }, {});
      console.log(jsonData);

      this.convertedJSON = jsonData[Object.keys(jsonData)[0]]; // (jsonData.Sheet1);
      console.log('convertedJSON', this.convertedJSON);
    // var i =   _.uniqBy(this.convertedJSON, 'job_id');
    // console.log('i ', i );

    }
    reader.readAsBinaryString(file);
  }

  callvalues(){

   
    

    this.convertedJSON.forEach(e2 => {
    var i =   {
        "operation_type":"CREATE",
        "id":e2.id,
        "job_id":e2.job_id,
        "candidate_id":e2.candidate_id,
        "candidate_name":e2.candidate_name,
        "candidate_email":e2.candidate_email,
        "candidate_mobile":e2.candidate_mobile,
        "comments":"",
        "status":e2.status,
        "previous_status":e2.previous_status
          }
      console.log('i', i);

      this.attendanceService.CallAPIPOST('api/Values/UpdateRecruitmentTransaction', i).subscribe((r) => {
        console.log(r);
      })
      
      
      
    });
  }

}
