import { Component, OnInit } from '@angular/core';
import { ImportLayoutService } from 'src/app/_services/service/import-layout.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ImportTreeNode } from '../../import-models';
import { ConfigureImportInputModalComponent } from 'src/app/shared/modals/generic-import-modals/configure-import-input-modal/configure-import-input-modal.component';

@Component({
  selector: 'app-configure-import-inputs',
  templateUrl: './configure-import-inputs.component.html',
  styleUrls: ['./configure-import-inputs.component.css']
})
export class ConfigureImportInputsComponent implements OnInit {

  node : ImportTreeNode;

  constructor(
    private importLayoutService : ImportLayoutService,
    public modalService : NgbModal,
    private router : Router
  ) { }

  ngOnInit() {
    this.node = this.importLayoutService.node;
    console.log(this.node);
    console.log(this.importLayoutService.ColumnNamesObject);
  }

  onClickingAddControlElementButton(node : ImportTreeNode){
    const modalRef = this.modalService.open(ConfigureImportInputModalComponent);
    modalRef.componentInstance.editing = false;
    modalRef.result.then((result) => {
      console.log(node);
    })

  }

  onClickingEditButton(node : ImportTreeNode , i : number){
    const modalRef = this.modalService.open(ConfigureImportInputModalComponent);
    modalRef.componentInstance.editing = true;
    modalRef.componentInstance.index = i;
    modalRef.result.then((result) => {
      console.log(node);
    })
  }

  onClickingDeleteButton(node : ImportTreeNode , i : number){
    node.ControlElementsList.splice(i,1);
  }

  onClickingDoneButton(){
    
  }
}
