import { Product, _Product } from "./Product";



export class ProductModel  {
    NewProductDetails: Product;
    OldProductDetails: Product;    
    customObject1: any;
    customObject2: any;
    Id: number;
   
}

export const _productmodel : ProductModel = {

    NewProductDetails: _Product,
    OldProductDetails: _Product,    
    customObject1: null,
    customObject2: null,
    Id: 0
   
}
