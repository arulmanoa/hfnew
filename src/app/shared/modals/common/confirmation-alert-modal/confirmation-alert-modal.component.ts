import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-alert-modal',
  templateUrl: './confirmation-alert-modal.component.html',
  styleUrls: ['./confirmation-alert-modal.component.css']
})
export class ConfirmationAlertModalComponent implements OnInit {
  showApprovemode : boolean  = true;
  constructor(
    private activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {
  }

  ActionOfSelection(value) {
    value == 1 ? this.showApprovemode = true : this.showApprovemode = false;
  }

  closeConfrimationAlert(){
    this.activeModal.close('Modal Closed');
  }

  proceedConfirmationAlert(){
    this.showApprovemode == true ? this.activeModal.close('Proceed') : this.activeModal.close('Only Approve') ;
  }
}
