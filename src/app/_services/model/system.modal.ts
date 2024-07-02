import { FunctionGroup } from "./functiongroup.modal";

export class BusinessSystem{
    public Id:number;
    public Name:string;
    public Code:string;
    public ImplementationId:number;
    public ApplicationVersionId:number;
    public Description:string;
    public FunctionGroupList:FunctionGroup[];
    public CreatedBy:string;
    public LastUpdatedBy:string;
    public IsActive:boolean;

    constructor() {
      this.FunctionGroupList = [];
  }
  }