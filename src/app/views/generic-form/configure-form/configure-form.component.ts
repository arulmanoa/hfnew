import { Component, OnInit } from '@angular/core';
import { FormLayout, DataSourceTreeNode } from '../form-models';
import { DataSourceType } from '../../personalised-display/enums';
import { DataSource } from '../../personalised-display/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigureModalComponent } from 'src/app/shared/modals/generic-form-modals/configure-modal/configure-modal.component';
import { RelationWithParent } from '../enums';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';
import { Router } from '@angular/router';
import { ThemeService } from 'ng2-charts';
import { AlertService } from 'src/app/_services/service/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configure-form',
  templateUrl: './configure-form.component.html',
  styleUrls: ['./configure-form.component.css']
})
export class ConfigureFormComponent implements OnInit {

  code : string;
  formLayout : FormLayout;
  spinner : boolean = false;  



  constructor(
    public alertService : AlertService,
    public modalService: NgbModal,
    private formLayoutService : FormLayoutService,
    private router : Router
  ) { }

  ngOnInit() {
    
    
    if(this.formLayoutService.formLayout !== undefined && this.formLayoutService.formLayout !== null ){
      this.formLayout = this.formLayoutService.formLayout;
      console.log(this.formLayout);
    }

    

  }

  onClickingEditButton(){
    if(this.code !== undefined && this.code !== null && this.code !== ''){
      this.formLayoutService.editing=true;
      this.spinner = true;

      this.formLayoutService.getFormLayout(this.code).subscribe(
        data => {
          this.spinner = false;
          if(data.Status == true && data.dynamicObject !== null){
            this.formLayoutService.formLayout = data.dynamicObject;
            this.formLayout = this.formLayoutService.formLayout;
            console.log(this.formLayout);
          }
          else{
            console.log(data);
            this.alertService.showWarning(data.Message);
          }
        },
        error => {
          this.spinner = false;
          console.log(error);
          this.alertService.showWarning("Could not get Form Configuration! Unknown Error Occured!");
        }
      )
    }
    else{
      this.alertService.showWarning("Please Enter valid code");
    }

  }

  onClickingAddNewButton(){
    this.formLayoutService.formLayout = new FormLayout();
    this.formLayout = this.formLayoutService.formLayout;
    this.formLayoutService.ColumnNamesObject = {};
    this.formLayoutService.editing = false;
  }

  onClickingAddParentButton(){
    console.log("Parent");
    this.formLayout.DataSourceTree = new DataSourceTreeNode();
    this.formLayout.DataSourceTree.DataSource = new DataSource();
    // this.formLayout.DataSourceTree.DataSource.Name = 'New DataSource';
    // this.formLayout.DataSourceTree.RelationWithParent = RelationWithParent.None;
    
    const modalRef = this.modalService.open(ConfigureModalComponent);
    modalRef.componentInstance.inputNode = this.formLayout.DataSourceTree;
    modalRef.componentInstance.formLayout = this.formLayout;
    modalRef.componentInstance.parent = true;
    modalRef.result.then((result) => {
      console.log(this.formLayout.DataSourceTree);
    })
  }

  onClickingAddChildButton(node : DataSourceTreeNode){
    const modalRef = this.modalService.open(ConfigureModalComponent);
    modalRef.componentInstance.inputNode = node;
    modalRef.componentInstance.formLayout = this.formLayout;
    modalRef.componentInstance.editing = false;
    modalRef.componentInstance.parent = false;
    modalRef.result.then((result) => {
      console.log(this.formLayout.DataSourceTree);
    })

  }

  // openAccordianById(id : string){
  //   let elem = (<HT>document.getElementById(id));
  //   elem.toggle
  // }

  onClickingEditNodeButton(node : DataSourceTreeNode){
    console.log("Editing " , node);
    const modalRef = this.modalService.open(ConfigureModalComponent);
    modalRef.componentInstance.inputNode = node;
    modalRef.componentInstance.formLayout = this.formLayout;
    modalRef.componentInstance.editing = true;
    modalRef.componentInstance.parent = false;
    modalRef.result.then((result) => {
      console.log(this.formLayout.DataSourceTree);

    })

  }

  onClickingConfigureInputsButton(node : DataSourceTreeNode){
    this.formLayoutService.node = node;
    this.router.navigate(['app/forms/configureInputs'] , {skipLocationChange : true})
  }

  onClickingConfigureGridButton(node : DataSourceTreeNode){
    console.log("Switich component");
    this.formLayoutService.node = node;
    this.router.navigate(['app/forms/configureGrid'] , {skipLocationChange : true}) 
  }


  onClickingSubmitButton(){
    console.log(this.formLayout);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.spinner = true;
        this.formLayoutService.postFormLayout(this.formLayout).subscribe(data => 
        {
          this.spinner = false;
          if(data.Status){
            this.alertService.showSuccess(data.Message);
            this.formLayoutService.formLayout = null;
            this.formLayout = null;
          }
          else {
            this.alertService.showWarning(data.Message);
            console.log(data);
          }
          
          
        }, error =>
        {
          this.spinner = false;
          this.alertService.showWarning("Sorry! Error Occured")
          console.log(error);
          
        });

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })

    
  }

  onClickingCancelButton(){
    this.formLayoutService.formLayout = null;
    this.formLayout = null;
  }
}
