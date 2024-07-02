import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-webview-modal',
  templateUrl: './webview-modal.component.html',
  styleUrls: ['./webview-modal.component.css']
})
export class WebviewModalComponent implements OnInit {

  jotFormURL = environment.environment.jotFormURL;
  constructor(    private activeModal: NgbActiveModal,
    ) {
      // this.jotFormURL = environment.environment.jotFormURL;
     }

  ngOnInit() {

  }

  confirmExit(){   
    this.activeModal.close();
  }

}
