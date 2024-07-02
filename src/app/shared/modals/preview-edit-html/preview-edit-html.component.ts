import { Component, Input, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-preview-edit-html',
  templateUrl: './preview-edit-html.component.html'
})
export class PreviewEditHtmlComponent implements OnInit {
  @Input() htmlContent: string = '';
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '28rem',
    minHeight: '28rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  }

  constructor( private activeModal: NgbActiveModal,) { }

  ngOnInit() {
  }

  saveDoc() {
    console.log(this.htmlContent);
    this.activeModal.close(this.htmlContent);
  }

  closeModal(){
    this.activeModal.close('Modal Closed');
  }

}
