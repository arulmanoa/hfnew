import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-remarks-modal',
  templateUrl: './remarks-modal.component.html',
  styleUrls: ['./remarks-modal.component.css']
})
export class RemarksModalComponent implements OnInit {

 @Input() headerText: string = '';
 @Input() subHeaderText: string = '';
 @Input() remarksText: string = '';
 
  remarks: any;

  constructor(private activeModal: NgbActiveModal,private appRef: ApplicationRef,) { this.appRef.tick();}

  ngOnInit() {

  }
  Save() {
    this.activeModal.close(this.remarks);
  }
  closeModal() {
    this.activeModal.close('Modal Closed');
  }


}
