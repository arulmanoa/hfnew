import { BaseModel } from "./Common/BaseModel";

export class ProductGroup extends BaseModel {
    code: string;
    name: string;
    description: string;
    Status:number;
}

export const _ProductGroup : ProductGroup = {
Id : 0,
code : '',
name : '',
description : '',
Status:0
   
}
