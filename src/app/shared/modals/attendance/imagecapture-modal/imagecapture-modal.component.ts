import { Component, OnInit, Input } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { SessionStorage } from 'src/app/_services/service';
@Component({
  selector: 'app-imagecapture-modal',
  templateUrl: './imagecapture-modal.component.html',
  styleUrls: ['./imagecapture-modal.component.css']
})
export class ImagecaptureModalComponent implements OnInit {
  @Input() employeeDetails: any;
  @Input() objStorageJson: any;

  showWebcam = true;
  isCameraExist = true;
  errors: WebcamInitError[] = [];
  errorMessage : any ;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  CapturedBase64Image: any = null;
  camPermission: boolean = false;
  imageName;
  isLoading: boolean = false;
  _loginSessionDetails: LoginResponses;
  BusinessType : number;

  constructor(
    private activeModal: NgbActiveModal, 
    public fileuploadService: FileUploadService,
    private sessionService: SessionStorage


  ) { }

  ngOnInit() {
    this.isLoading = false;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    // this.imageName = `PunchInOut_${this.employeeDetails.EmployeeName}${this.employeeDetails.EmployeeCode}`;
    this.accessUserCamera();
    this.errorMessage = 'Modal Closed';
  }

  accessUserCamera() {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        console.log('mediaDevices', mediaDevices);

        this.isCameraExist = mediaDevices && mediaDevices.length > 0;
      });
  }
  takeSnapshot(): void {
    this.trigger.next();
  }

  onOffWebCame() {
    this.showWebcam = !this.showWebcam;
  }



  changeWebCame(directionOrDeviceId: boolean | string) {
    this.nextWebcam.next(directionOrDeviceId);
  }

  handleImage(webcamImage: WebcamImage) {
    console.log('webcamImage', webcamImage);
    this.CapturedBase64Image = webcamImage.imageAsBase64;
    this.showWebcam = true;
    this.isLoading = true;



    // const arr = webcamImage.imageAsDataUrl.split(",");
    // const mime = arr[0].match(/:(.*?);/)[1];
    // const bstr = atob(arr[1]);
    // let n = bstr.length;
    // const u8arr = new Uint8Array(n);
    // while (n--) {
    //   u8arr[n] = bstr.charCodeAt(n);
    // }
    // const file: File = new File([u8arr], 'punchinout', { type: "image/jpeg" });
    const file = this.dataURLtoFile(`data:imshr;base64,${this.CapturedBase64Image}`);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {

      let FileUrl = (reader.result as string).split(",")[1];
      this.doAsyncUpload(FileUrl, 'punchinout.jpeg')

    };

    console.log(file);

    // this.activeModal.close(this.CapturedBase64Image);

  }


  dataURLtoFile(dataurl) {

    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], 'punchinout.jpg', { type: mime });
  }

  doAsyncUpload(filebytes, filename) {
    this.isLoading = true;

    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;

      objStorage.EmployeeId = this.objStorageJson.EmployeeId;
      objStorage.ClientContractCode =  this.BusinessType == 3 ? "" :this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? ""  : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.objStorageJson.ClientContractId;
      objStorage.ClientId = this.objStorageJson.ClientId;
      objStorage.CompanyId = this.objStorageJson.CompanyId;
      
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "EmpTransactions";



      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {

        

        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {
            this.isLoading = false;
            this.trigger.complete();
            this.activeModal.close(apiResult.Result);
          }
          else {
            this.isLoading = false;
          }
        } catch (error) {
          this.isLoading = false;
        }
      }), ((err) => {
        this.isLoading = false;
      })

      console.log(objStorage);
    } catch (error) {
      this.isLoading = false;
    }

  }


  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
  modal_dismiss1() {
    this.CapturedBase64Image = null;
    this.showWebcam = false;
    this.isCameraExist = false;
    // this.isLoading = false;
    console.log('this.errorMessage',this.errorMessage);
    this.trigger.complete();
    this.activeModal.close(this.errorMessage);
  }

  public handleInitError(error: WebcamInitError): void {
    console.log('error', error);
    this.errorMessage = error.message;

    this.errors.push(error);
    if (error.mediaStreamError && error.mediaStreamError.name === 'NotAllowedError') {
      this.camPermission = true;
      // alert('Camera access was not allowed by user!');
      console.warn('Camera access was not allowed by user!');
    }
  }

  close() {
    this.showWebcam = false;
    console.log('this.errorMessage',this.errorMessage);
    this.trigger.complete();
    this.activeModal.close(this.errorMessage);
  }
  
  ngOnDestroy(): void {
    this.trigger.complete();
    console.log("ngOnDestroy completed");
  }
}
