import { Component, OnInit } from '@angular/core';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';
import { DataSourceTreeNode, RowDetails, ColumnDetails } from '../../form-models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigureColumnModalComponent } from 'src/app/shared/modals/generic-form-modals/configure-column-modal/configure-column-modal.component';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { RelationWithParent } from '../../enums';
import { ConfigureInputsModalComponent } from 'src/app/shared/modals/generic-form-modals/configure-inputs-modal/configure-inputs-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configure-inputs',
  templateUrl: './configure-inputs.component.html',
  styleUrls: ['./configure-inputs.component.scss']
})
export class ConfigureInputsComponent implements OnInit {
  node : DataSourceTreeNode;
  constructor(
    private formLayoutService : FormLayoutService,
    public modalService : NgbModal,
    private router : Router
  ) { }

  ngOnInit() {
    this.node = this.formLayoutService.node;
    // this.node = new DataSourceTreeNode();
    // this.node = {
    //   DataSource : {
    //     Name : 'TaxCode',
    //     IsCoreEntity : true,
    //     Type : DataSourceType.View
    //   },
    //   Children : [],
    //   IsParent : true ,
    //   RelationWithParent : RelationWithParent.None,
    //   RowDetailsList : []
    // }
    console.log(this.node);
    console.log(this.formLayoutService.ColumnNamesObject);
  }

  onClickingAddRowButton(rowDetailsList : RowDetails[]){
    rowDetailsList.push(new RowDetails());
  }

  onClickingDeleteRowButton(rowDetailsList : RowDetails[] , i : number){
    console.log(rowDetailsList , i);
    rowDetailsList.splice(i,1);
  }

  onClickingAddColumnButton(rowDetails : RowDetails){
    const modalRef = this.modalService.open(ConfigureColumnModalComponent);
    modalRef.componentInstance.editing = false;
    modalRef.componentInstance.rowDetails = rowDetails;
    modalRef.result.then((result) => {
      console.log(rowDetails);
    })
  }

  onClickingEditColumnButton(rowDetails : RowDetails , i : number){

    const modalRef = this.modalService.open(ConfigureColumnModalComponent);
    console.log(i);
    modalRef.componentInstance.editing = true;
    modalRef.componentInstance.rowDetails = rowDetails;
    modalRef.componentInstance.index = i;
    modalRef.result.then((result) => {
      console.log(rowDetails);
    })

  }

  onClickingDeleteColumnButton(rowDetails : RowDetails , i : number){
    rowDetails.ColumnDetailsList.splice(i,1);
  }

  onClickingConfigureInputButton(columnDetails : ColumnDetails){

    const modalRef = this.modalService.open(ConfigureInputsModalComponent);
    modalRef.componentInstance.controlElement = columnDetails.ControlElement;
    modalRef.componentInstance.node = this.node;
    modalRef.result.then((result) => {
      console.log(this.node);
    })

  }

  onClickingDoneButton(){
    this.router.navigate(['app/forms/configure/form']);
  }

}
