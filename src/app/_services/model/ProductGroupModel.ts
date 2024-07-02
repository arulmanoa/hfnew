import { ProductGroup, _ProductGroup } from "./ProductGroup";



export class ProductGroupModel  {
    NewProductGroupDetails: ProductGroup;
    OldProductGroupDetails: ProductGroup;    
    customObject1: any;
    customObject2: any;
    Id: number;
   
}

export const _productgroupmodel : ProductGroupModel = {

    NewProductGroupDetails: _ProductGroup,
    OldProductGroupDetails: _ProductGroup,    
    customObject1: null,
    customObject2: null,
    Id: 0
   
}
