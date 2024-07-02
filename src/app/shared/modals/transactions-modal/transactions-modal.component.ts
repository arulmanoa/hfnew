import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-transactions-modal',
  templateUrl: './transactions-modal.component.html',
  styleUrls: ['./transactions-modal.component.scss']
})
export class TransactionsModalComponent implements OnInit {

  @Input() CandidateInfo: any

  EmployeeName: any;
  EmployeeCode: any;
  ClientName: any;
  PreviewList: any;
  DocumentList: any;

  constructor(
    private activeModal: NgbActiveModal,

  ) { 
    
  }

  ngOnInit() {

    
  }


  closeModal() {

    this.activeModal.close('Modal Closed');
  }
}
