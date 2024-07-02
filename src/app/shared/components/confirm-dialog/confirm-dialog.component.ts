import { Component, OnInit, Inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],

})
export class ConfirmDialogComponent {

  modalHeader: string;
  modalContent = ``;

  title: string;
  message: string;

  constructor(
    private activeModal: NgbActiveModal,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    // Update view with given values
    this.title = data.title;
    this.message = data.message;
  }

 

  close(): void {
    this.activeModal.close(false);
  }

  confirm(): void {
    this.activeModal.close(true);
  }

  ngOnInit() {
  }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}


/**
 * Class to represent confirm dialog model.
 *
 * It has been kept here to keep it as part of shared component.
 */
export class ConfirmDialogModel {

  constructor(public title: string, public message: string) {
    
  }
}