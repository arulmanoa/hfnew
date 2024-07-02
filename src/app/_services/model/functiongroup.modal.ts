// import { Functionn } from './function';
import { MethodDetails } from './methoddetails.modal';

export class FunctionGroup{
    
    public Name:string;
    public Description:string;
    public FunctionList:MethodDetails[];

    constructor() {
        this.FunctionList = [];
    }

    public IsEdited:boolean;
    public IsSelected:boolean;
  }