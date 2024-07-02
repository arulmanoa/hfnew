import { Component, OnInit ,Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService } from '../../../_services/service/alert.service';
import { UIMode } from 'src/app/_services/model/UIMode';
import { ProductType,_ProductType} from 'src/app/_services/model/ProductType';
import { ProductTypeModel, _producttypemodel} from 'src/app/_services/model/ProductTypeModel';
import {ProductTypeService} from '../../../_services/service/producttype.service';
@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.css']
})
export class ProductTypeComponent implements OnInit {

  @Input() id: number;
  @Input() jsonObj: any;

  ProductType: ProductType = {} as any;
  ProductTypeModel : ProductTypeModel;
  producttypeForm: FormGroup;
  submitted = false;

  constructor(private activeModal: NgbActiveModal,private formBuilder: FormBuilder,
    private ProductTypeService:ProductTypeService,private alertService: AlertService) { }

  get f() { return this.producttypeForm.controls; }

  ngOnInit() {
    this.producttypeForm = this.formBuilder.group({
      Id: [0],   
      name: [null, Validators.required],
      description: [''],    
      code: ['',[Validators.required, Validators.minLength(2)]],  
      status: [true],        
    })

    console.log(this.id);
    console.log('jjjjj',this.jsonObj);
   
    var j = []
    if (this.id) {
      if(this.jsonObj[0].Status == "In-Active"){
        this.jsonObj[0].Status = 0;
      }
      if(this.jsonObj[0].Status == "Active"){
        this.jsonObj[0].Status = 1;
      }

      this.producttypeForm.patchValue({
        
        "Id": this.jsonObj[0].Id,        
        "name": this.jsonObj[0].Name,
        "code": this.jsonObj[0].Code,
        "description": this.jsonObj[0].Description,
        "status": this.jsonObj[0].Status == 1 ?  true : false,
        
      });
      this.producttypeForm.controls['code'].disable();
      _producttypemodel.OldProductTypeDetails = this.jsonObj;
      _producttypemodel.NewProductTypeDetails = this.jsonObj;
    }
  }
  closeModal() {

    this.activeModal.close('Modal Closed');

  }
  saveproducttypebutton(): void {    
    this.submitted = true;
    if (this.producttypeForm.invalid) {
      this.alertService.showInfo("Please fill the Mandatory fields ")
      return;
    }
    // this.IsdataExists();

    //   if (this.isExists) {

    //     this.alertService.showWarning("The location code/name is already exists");
    //     return;

    //   }

    
    this.ProductType.Id = this.producttypeForm.get('Id').value;
    this.ProductType.name = this.producttypeForm.get('name').value;
    this.ProductType.code = this.producttypeForm.get('code').value;
    this.ProductType.description = this.producttypeForm.get('description').value;
    this.ProductType.Status =this.producttypeForm.get('status').value == false ? 0 :1;
    // this.ProductType.Status = false ? 0 :1;
  
    _producttypemodel.NewProductTypeDetails = this.ProductType;

    if(this.ProductType.Id >0)
    {     
      // this.jsonObj[0] = JSON.parse(this.jsonObj[0]);
      _producttypemodel.OldProductTypeDetails=this.jsonObj[0];
    }
    else{     
      _producttypemodel.OldProductTypeDetails=_ProductType;
    }
      
    var ProductType_request_param = JSON.stringify(_producttypemodel);
    console.log(ProductType_request_param);

    if (this.ProductType.Id > 0) { // edit 
     // this.ProductType.Modetype = UIMode.Edit;
      this.ProductTypeService.putProductType(ProductType_request_param).subscribe((data: any) => {

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
      this.ProductTypeService.postProductType(ProductType_request_param).subscribe((data: any) => {

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
