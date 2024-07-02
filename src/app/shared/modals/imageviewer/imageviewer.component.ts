import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadService } from 'src/app/_services/service';

@Component({
  selector: 'app-imageviewer',
  templateUrl: './imageviewer.component.html',
  styleUrls: ['./imageviewer.component.css']
})
export class ImageviewerComponent implements OnInit {
  @Input() PunchInOutDetails: any
  contentmodalurl: any = null;
  contentmodalurl1: any = null;
  loader: boolean = false;

  lat =  78.1197754;
  lng = 9.9252007;
  
  constructor(

    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
    private activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {

    console.log('PunchInOutDetails', this.PunchInOutDetails);

    this.PunchInOutDetails.PunchInPhotoId > 0 && this.openmodalpopupdocument(this.PunchInOutDetails.PunchInPhotoId);
    this.PunchInOutDetails.PunchOutPhotoId > 0 && this.openmodalpopupdocument1(this.PunchInOutDetails.PunchOutPhotoId);


  }



  openmodalpopupdocument(ObjectStorageId) {
    this.loader = true;
    this.contentmodalurl = null;

    // this.currentModalItem = item;
    // this.currentModalHeading = type;
    // this.currentModalDetailsFormat = format;


    var contentType = 'image'; // this.objectApi.getContentType(item.DocumentName);
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.objectApi.getObjectById(ObjectStorageId)
        .subscribe(dataRes => {


          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.loader = false;
            return;
            //handle error
          }
          let file = null;

          var objDtls = dataRes.Result;

          const byteArray = atob(objDtls.Content);
          const blob = new Blob([byteArray], { type: contentType });
          file = new File([blob], objDtls.ObjectName, {
            type: contentType,
            lastModified: Date.now()
          });


          if (file !== null) {
            this.loader = false;
            //const newPdfWindow = window.open('', '');
            var urll = 'data:image/jpg' + ';base64,' + encodeURIComponent(objDtls.Content);
            // this.sanitizer.sanitize(SecurityContext.URL, urll);
            this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            console.log(this.contentmodalurl);
          }
          // // tslint:disable-next-line:max-line-length
          // const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

          // const iframeEnd = '\'><\/iframe>';

          // newPdfWindow.document.write(iframeStart + content + iframeEnd);
          // newPdfWindow.document.title = data.OriginalFileName;
          // // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

      var appUrl = this.objectApi.getUrlToGetObject(ObjectStorageId);
      // tslint:disable-next-line:quotemark..change this
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
      console.log(this.contentmodalurl);


    }



  }

  openmodalpopupdocument1(ObjectStorageId) {

    this.contentmodalurl1 = null;
    this.loader = true;
    // this.currentModalItem = item;
    // this.currentModalHeading = type;
    // this.currentModalDetailsFormat = format;


    var contentType = 'image'; //this.objectApi.getContentType(item.DocumentName);
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.objectApi.getObjectById(ObjectStorageId)
        .subscribe(dataRes => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.loader = false;
            return;

            //handle error
          }
          let file = null;

          var objDtls = dataRes.Result;

          const byteArray = atob(objDtls.Content);
          const blob = new Blob([byteArray], { type: contentType });
          file = new File([blob], objDtls.ObjectName, {
            type: contentType,
            lastModified: Date.now()
          });


          if (file !== null) {
            this.loader = false;
            //const newPdfWindow = window.open('', '');
            var urll = 'data:image/jpg' + ';base64,' + encodeURIComponent(objDtls.Content);
            // this.sanitizer.sanitize(SecurityContext.URL, urll);
            this.contentmodalurl1 = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            console.log(this.contentmodalurl1);
          }
          // // tslint:disable-next-line:max-line-length
          // const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

          // const iframeEnd = '\'><\/iframe>';

          // newPdfWindow.document.write(iframeStart + content + iframeEnd);
          // newPdfWindow.document.title = data.OriginalFileName;
          // // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

      var appUrl = this.objectApi.getUrlToGetObject(ObjectStorageId);
      // tslint:disable-next-line:quotemark..change this
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.contentmodalurl1 = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
      console.log(this.contentmodalurl1);


    }



  }


  close() {
    this.activeModal.close('Modal Closed');

  }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  mapClicked($event: MouseEvent) {
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
  }

  markerDragEnd(m: marker, $event: MouseEvent) {
    console.log('dragEnd', m, $event);
  }

  markers: marker[] = [
    {
      lat: 51.673858,
      lng: 7.815982,
      label: 'A',
      draggable: true
    },
    {
      lat: 51.373858,
      lng: 7.215982,
      label: 'B',
      draggable: false
    },
    {
      lat: 51.723858,
      lng: 7.895982,
      label: 'C',
      draggable: true
    }
  ]
  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     console.log('Resizing');
  //     this.agmMap.triggerResize();
  //   }, 100);
  // }
}


// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}


