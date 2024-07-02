import { ProductType, _ProductType } from "./ProductType";



export class ProductTypeModel  {
    NewProductTypeDetails: ProductType;
    OldProductTypeDetails: ProductType;    
    customObject1: any;
    customObject2: any;
    Id: number;
   
}

export const _producttypemodel : ProductTypeModel = {

    NewProductTypeDetails: _ProductType,
    OldProductTypeDetails: _ProductType,    
    customObject1: null,
    customObject2: null,
    Id: 0
   
}
