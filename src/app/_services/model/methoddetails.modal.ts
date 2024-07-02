import {ParameterDetails  } from "./parameterdetails.modal";

export class MethodDetails
{
    //Method details
    public Name: string;
    public ParamString:string;
    public ReturnTypeName: string;
    public ReturnTypeDisplayName: string;
    public ReturnType: string;
    public Summary: string;
    public DisplayName: string;
    public DisplayParamString:string;
    public IsSelected:boolean;
    public AssemblyName:string;
    public Signature: string;
    public ClassName: string;
    public ClassFullyQualifiedName: string;

    public ParameterList: ParameterDetails[];

    constructor()
    {
        this.ParameterList=[];
        
    }
}