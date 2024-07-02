import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-states-modal',
  templateUrl: './states-modal.component.html',
  styleUrls: ['./states-modal.component.css']
})
export class StatesModalComponent implements OnInit {

  @Input() id: number;
  stateForm: FormGroup;
  
  // ** forms on submit validation ** //
  submitted = false;  

  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder

  ) {
    this.createForm();
  }

  get f() { return this.stateForm.controls; } // reactive forms validation 

  createForm() {

  
    this.stateForm = this.formBuilder.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

  }

  //  submitForm() {
  //    this.activeModal.close(this.myForm.value + '\n' + this.id);
  //  }


  ngOnInit() {



  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }


  savebutton(): void {

    this.submitted = true;
    if (this.stateForm.invalid) {
      return;
    }

  }


}