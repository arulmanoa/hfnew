import { BaseModel } from "./Common/BaseModel";

export class ProductType extends BaseModel {
    code: string;
    name: string;
    description: string;
    Status:number;
}
export const _ProductType : ProductType = {
    Id : 0,
    code : '',
    name : '',
    description : '',
    Status:0 

    }