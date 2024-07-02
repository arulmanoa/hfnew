import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService } from '../../../_services/service/alert.service';
import { UIMode } from 'src/app/_services/model/UIMode';
import { ProductGroupModel, _productgroupmodel} from 'src/app/_services/model/ProductGroupModel';
import { ProductGroup, _ProductGroup} from 'src/app/_services/model/ProductGroup';

import {ProductGroupService} from '../../../_services/service/productgroup.service';

@Component({
  selector: 'app-product-group',
  templateUrl: './product-group.component.html',
  styleUrls: ['./product-group.component.css']
})
export class ProductGroupComponent implements OnInit {
  @Input() id: number;
  @Input() jsonObj: any;

  productgroupForm: FormGroup;
  productGrp: ProductGroup = {} as any;
  ProductGroupModel : ProductGroupModel;
  submitted = false;
  constructor(private activeModal: NgbActiveModal,private formBuilder: FormBuilder,
    private alertService: AlertService,private ProductGroupService:ProductGroupService,) { }

  get f() { return this.productgroupForm.controls; }
  ngOnInit() {

    this.productgroupForm = this.formBuilder.group({
      Id: [0],   
      name: [null, Validators.required],
      description: [''],    
      code: ['',[Validators.required, Validators.minLength(2)]], 
      status: [true],         
    })
   // this.productgroupForm.controls['isActive'].disable(); 
    console.log(this.id);
    console.log('jjjjj',this.jsonObj);
   
    var j = []
    if (this.id > 0) {
      if(this.jsonObj[0].Status == "In-Active"){
        this.jsonObj[0].Status = 0;
      }
      if(this.jsonObj[0].Status == "Active"){
        this.jsonObj[0].Status = 1;
      }

      this.productgroupForm.patchValue({
        
        "Id": this.jsonObj[0].Id,        
        "name": this.jsonObj[0].Name,
        "code": this.jsonObj[0].Code,
        "description": this.jsonObj[0].Description,
        "status": this.jsonObj[0].Status == 1 ?  true : false,
        
      });
      this.productgroupForm.controls['code'].disable();    
      _productgroupmodel.OldProductGroupDetails = this.jsonObj;
      _productgroupmodel.NewProductGroupDetails = this.jsonObj;
      
    }

   }
  closeModal() {

    this.activeModal.close('Modal Closed');

  }

  saveproductgroupbutton(): void {    
    this.submitted = true;
    if (this.productgroupForm.invalid) {
      this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }
    // this.IsdataExists();

    //   if (this.isExists) {

    //     this.alertService.showWarning("The location code/name is already exists");
    //     return;

    //   }

    
    this.productGrp.Id = this.productgroupForm.get('Id').value;
    this.productGrp.name = this.productgroupForm.get('name').value;
    this.productGrp.code = this.productgroupForm.get('code').value;
    this.productGrp.description = this.productgroupForm.get('description').value;
    this.productGrp.Status =this.productgroupForm.get('status').value == false ? 0 : 1;
    // this.productGrp.Status = false ? 0 :1;
   // this.productGrp.Status = 1;
    //_productgroupmodel.NewProductGroupDetails = _ProductGroup;
    _productgroupmodel.NewProductGroupDetails = this.productGrp;

    if(this.productGrp.Id >0)
    {     
      // this.jsonObj[0] = JSON.parse(this.jsonObj[0]);
      _productgroupmodel.OldProductGroupDetails=this.jsonObj[0];
    }
    else{     
      _productgroupmodel.OldProductGroupDetails=_ProductGroup;
    }
    
    var productgroup_request_param = JSON.stringify(_productgroupmodel);
    console.log(productgroup_request_param);

    if (this.productGrp.Id > 0) { // edit 
      //this.ProductGroup.Modetype = UIMode.Edit;
      this.ProductGroupService.putProductGroup(productgroup_request_param).subscribe((data: any) => {

        // this.spinnerEnd();
        console.log(data);
        if (data.Status == true) {

          this.activeModal.close('Modal Closed');
          this.alertService.showSuccess(data.Message);

        } else {

          this.alertService.showInfo(data.Message);
        }



      },
        (err) => {
          // this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });

    } else {   // create
      this.ProductGroupService.postProductGroup(productgroup_request_param).subscribe((data: any) => {

        // this.spinnerEnd();
        console.log(data);

        if (data.Status) {

          this.activeModal.close('Modal Closed');

          this.alertService.showSuccess(data.Message);

        } else {

          this.alertService.showInfo(data.Message);
        }

      },
        (err) => {
          // this.spinnerEnd();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);

        });
    }



  }
}
