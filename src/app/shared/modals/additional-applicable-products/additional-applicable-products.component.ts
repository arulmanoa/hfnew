import { Component, Input, OnInit } from '@angular/core';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { PaymentType } from 'src/app/_services/model/Base/HRSuiteEnums';

@Component({
  selector: 'app-additional-applicable-products',
  templateUrl: './additional-applicable-products.component.html',
  styleUrls: ['./additional-applicable-products.component.css']
})
export class AdditionalApplicableProductsComponent implements OnInit {
  @Input() data: any;
  additionalProductData: any;

  constructor( private drawerRef: NzDrawerRef<string>,) { }

  ngOnInit() {
    this.additionalProductData = this.data.map(e => ({...e, PaymentName: this.labelNameFn(e.PaymentType), BillingName: this.labelNameFn(e.BillingType)}));
    console.log('Drawer data --->',  this.additionalProductData);
  }

  labelNameFn(id) {
    if (id == 1) {
      return 'Daily';
    }
    else if (id == 2) {
      return 'Weekly';
    }
    else if (id == 3) {
      return 'Monthly';
    }
  }
  
  onChangePayRateAmount(e, item) {
    console.log('** PAY RATE CHANGE **', e, item);
    item.PayableRate = Number(e);
    item.BillableRate = Number(e);
    this.data.findIndex(p => {
      if (p.ProductId == item.ProductId) {
        p.PayableRate = Number(e); 
        p.PaymentType = PaymentType.Daily // this.wageType == 'Hourly' ? PaymentType.Hourly : PaymentType.Daily;
        p.BillableRate = Number(e);
        p.BillingType = PaymentType.Daily;
      }
    }); 
  }

  onChangeBillRateAmount(e, item) {
    console.log('** BILL RATE CHANGE **', e, item);
    item.BillableRate = Number(e);
    this.data.findIndex(b => {
      if (b.ProductId == item.ProductId) {
        b.BillableRate = Number(e);
        b.BillingType = PaymentType.Daily;
      }
    });
  }

  cancelDrawer() {
    this.drawerRef.close();
  }

  saveAddlApplicableProduct() {
    this.drawerRef.close(this.data);
  }

}
