import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from '../../Service/app.service';
import { MandateRequirementDetails } from '../../Models/MandateRequirementDetails';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngbd-modal-config',
  templateUrl: './modal-config.html',
  // add NgbModalConfig and NgbModal to the component providers
  providers: [NgbModalConfig]
})
// tslint:disable-next-line:component-class-suffix
export class NgbdModalConfig implements OnInit {

  //  @Input()
  //  NameTxt: string;

  @Input() requirementDetails: MandateRequirementDetails;
  @Output() InputProvided = new EventEmitter();
  // @Output() InputsProvided = new EventEmitter();



  constructor(config: NgbModalConfig, public activeModal: NgbActiveModal,  private modalService: NgbModal, private appservice: AppService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.requirementDetails = appservice.getDefaultRequirementDetailsValues();
  }

  OnSubmit() {
    this.InputProvided.emit(this.requirementDetails);
    this.modalService.dismissAll();
    this.requirementDetails = this.appservice.getDefaultRequirementDetailsValues();
    // this.NameTxt = '';
  }

  // OnFormSubmit() {
  //   console.log(this.requirementDetails);
  //   this.InputsProvided.emit(this.requirementDetails);
  //   this.modalService.dismissAll();
  //   this.requirementDetails = this.appservice.getDefaultRequirementDetailsValues();
  // }
  open(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  ngOnInit(): void {

  }
}

