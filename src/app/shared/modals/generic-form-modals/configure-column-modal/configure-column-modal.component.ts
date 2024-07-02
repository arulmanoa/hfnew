import { Component, OnInit, Input } from '@angular/core';
import { RowDetails, ColumnDetails, ControlElement, GroupElement } from 'src/app/views/generic-form/form-models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ElementType, GroupType } from 'src/app/views/generic-form/enums';
import { DataSource } from 'src/app/views/personalised-display/models';

@Component({
  selector: 'app-configure-column-modal',
  templateUrl: './configure-column-modal.component.html',
  styleUrls: ['./configure-column-modal.component.css']
})
export class ConfigureColumnModalComponent implements OnInit {
  
  @Input() rowDetails : RowDetails;
  @Input() editing : boolean = false;
  @Input() index : number = -1;
  column : ColumnDetails

  elementTypeNames = [
    {
      label : 'Single Input Element',
      value : ElementType.ControlElement
    },
    {
      label : 'Group of Input Elements',
      value : ElementType.GroupElement
    }
  ]

  groupTypeNames = [
    {
      label : "Simple without Label",
      value : GroupType.SimpleWithoutLabel
    },
    {
      label : "Simple with Label",
      value : GroupType.SimpleWithLabel
    },
    {
      label : "Accordian",
      value : GroupType.Accordian
    },
    {
      label : "Border with label",
      value : GroupType.HighlightedBorder
    },
    
  ]

  constructor(
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
    console.log(this.rowDetails , this.editing , this.index);
    if(this.editing){
      if(this.index >= 0 ){
        this.column = this.rowDetails.ColumnDetailsList[this.index];
        console.log(this.column);
      }
    }
    else{
        this.column = new ColumnDetails();
        this.column.GroupElement = new GroupElement();
    }
    
  }

  closeModal(){
    if(!this.editing){
      if(this.column.ElementType == ElementType.ControlElement){
        this.column.ControlElement = new ControlElement();
        this.column.ControlElement.DataSource = new DataSource();
      }
      

      this.rowDetails.ColumnDetailsList.push(this.column);
    }
      
    this.activeModal.close();
  }

}
