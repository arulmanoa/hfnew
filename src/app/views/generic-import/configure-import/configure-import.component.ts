import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/_services/service/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ImportLayout, ImportTreeNode } from '../import-models';
import { ImportLayoutService } from 'src/app/_services/service/import-layout.service';
import { DataSource } from '../../personalised-display/models';
import { ConfigureDataSourceModalComponent } from 'src/app/shared/modals/generic-import-modals/configure-data-source-modal/configure-data-source-modal.component';

@Component({
  selector: 'app-configure-import',
  templateUrl: './configure-import.component.html',
  styleUrls: ['./configure-import.component.css']
})
export class ConfigureImportComponent implements OnInit {

  code : string;
  importLayout : ImportLayout;
  spinner : boolean = false;

  constructor(
    private importLayoutService : ImportLayoutService,
    public alertService : AlertService,
    public modalService: NgbModal,
    private router : Router
    ) { }

  ngOnInit() {
    if(this.importLayoutService.importLayout !== undefined && this.importLayoutService.importLayout !== null ){
      this.importLayout = this.importLayoutService.importLayout;
      console.log(this.importLayout);
    }
  }

  onClickingAddNewButton(){
    this.importLayoutService.importLayout = new ImportLayout();
    this.importLayout = this.importLayoutService.importLayout;
    this.importLayoutService.ColumnNamesObject = {};
    //this.importLayoutService.editing = false;
  }


  onClickingCancelButton(){
    this.importLayoutService.importLayout = null;
    this.importLayout = null;
  }

  onClickingAddParentButton(){
    console.log("Parent");
    this.importLayout.ImportTree = new ImportTreeNode();
    this.importLayout.ImportTree.DataSource = new DataSource();
    // this.formLayout.DataSourceTree.DataSource.Name = 'New DataSource';
    // this.formLayout.DataSourceTree.RelationWithParent = RelationWithParent.None;
    
    const modalRef = this.modalService.open(ConfigureDataSourceModalComponent);
    //modalRef.componentInstance.inputNode = this.importLayout.I;
    modalRef.componentInstance.editing = false;
    modalRef.componentInstance.parent = true;
    modalRef.result.then((result) => {
      console.log(this.importLayout.ImportTree);
    })
  }

  onClickingAddChildButton(node : ImportTreeNode){
    this.importLayoutService.node = node;

    const modalRef = this.modalService.open(ConfigureDataSourceModalComponent);
    modalRef.componentInstance.editing = false;
    modalRef.componentInstance.parent = false;
    modalRef.result.then((result) => {
      console.log(this.importLayout.ImportTree);
    })

  }

  onClickingEditNodeButton(node : ImportTreeNode){
    console.log("Editing " , node);
    this.importLayoutService.node = node;
    const modalRef = this.modalService.open(ConfigureDataSourceModalComponent);
    modalRef.componentInstance.editing = true;
    modalRef.componentInstance.parent = false;
    modalRef.result.then((result) => {
      console.log(this.importLayout.ImportTree);

    })

  }

  onClickingConfigureInputsButton(node : ImportTreeNode){
    this.importLayoutService.node = node;
    this.router.navigate(['app/imports/configureImportInputs'] , {skipLocationChange : true});
  }

}
