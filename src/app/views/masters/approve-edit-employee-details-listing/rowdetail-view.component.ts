import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../_services/service/alert.service';

@Component({
    templateUrl: './rowdetail-view.component.html',
    styleUrls: ['./rowdetail-view.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class RowDetailViewComponent implements OnInit {
    @Input() data: any;

    constructor(
        private activeModal: NgbActiveModal,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        console.log('**', this.data);
    }


    closeModal() {
        this.activeModal.close('Modal Closed');
    }

    closeModalWithData(data: any) {
        this.activeModal.close(data);
    }

    submitEmployeeMasterData(isApproved) {
        this.closeModalWithData({isApproved: isApproved, data: this.data});
    }
}