import { PageProperties, DataSource, GridConfiguration, SearchElement } from "../personalised-display/models";
import { FormInputControlType, GroupType, ElementType, RelationWithParent, DataType } from "./enums";
import { GridOption, Column, AngularGridInstance } from "angular-slickgrid";
import { ApiRequestType, ImportControlElementType } from "../generic-import/import-enums";
import { SaveExcelDataConfiguration } from "../generic-import/import-models";

export class FormLayout{
    Id?: number;
    Code: string;
    Description?:string = null;

    CompanyId?: number = 0;
    ClientId?: number=0;

    EntityType?: number;
    
    PageProperties : PageProperties;
    
    EntityRelations?: any  = {};

    DataSourceTree?: DataSourceTreeNode;

    SaveConfiguration : SaveFormConfiguration;
    
    IsReport?: boolean = false;

    Status?: boolean = true;

    // DataSource?: DataSource;
    // DataSourceList?: DataSource[];
    // RowDetailsList : RowDetails[];
}

export class DataSourceTreeNode {
    DataSource : DataSource;
    IsParent?: boolean = false; 
    Parent?: string; 
    RelationWithParent : RelationWithParent;
    RowDetailsList?: RowDetails[] = [];
    GridConfiguration?: GridConfiguration;
    Children : DataSourceTreeNode[] = [];
    Header?: string;
    OldRowDetailsList?: {
        Id : number;
        RowDetailsList : RowDetails[];
    }[];
    NewRowDetailsList?: {
        Id : number;
        RowDetailsList : RowDetails[];
    }[];

    //Only for ui
    AngularGrid?: AngularGridInstance;
    GridObj?: any; // grid object
    DataviewObj?: any;

    Columns?: Column[];
    GridOptions?: GridOption;
    Dataset?: any[];

    //Only for configuration Ui
    DataSourceList?: DataSource[];
    ColumnListObject?: {}

} 

export class RowDetails{
    ColSpan? : number;
    ColumnDetailsList?: ColumnDetails[] = [];
    Height?: number
    MaxHeight?: number;
    MinHeight?: number;
}

export class ColumnDetails{
    ColSpan?: number;
    ElementType?: ElementType;
    ControlElement?: ControlElement;
    GroupElement?: GroupElement;    
}

export class GroupElement{
    Type: GroupType = GroupType.SimpleWithoutLabel;
    RowDetailsList: RowDetails[] = [];
    Label?: string;
    FieldName?: string;
    DisplayOrder?: number;
    IsNestedGroup?: boolean = false;
    SaveInDifferentTable?: boolean = false;
    DataSource?: DataSource; 
    ForeignKeyFieldName?: string;
    ForeignKeyFieldNameInDifferentTable?: string;
}

export class ControlElement{

    //Basic
    Label?: string;
    FieldName : string;
    InputControlType?: FormInputControlType = FormInputControlType.TextBox;
    PlaceHolder?: string;
    Value?: string = null;
    MultipleValues?: string[];
    Type? : ImportControlElementType; // only for import 
    DefaultValue?: any;
    
    //Data 
    DisplayField?: string;
    ValueField?: string;
    DataSource?: DataSource;
    SearchElements?: SearchElement[] = null;
    DropDownList?: any[] = [];
    LoadDataOnPageLoad?: boolean  = true;
    ParentFields?: string[] = null; 
    ReadOnly?: boolean = false;
    EntityList?: string[] = [];
    InputNumber?: number;
    DataType?: DataType;
    

    //Display
    Alignment?: string;
    Width? : number;
    Validators? : {
        Name : string,
        PropertyNameInError : string;
        InvalidMessage : string
    }[];
    DisplayOrder?: number;
    StartFromNewRow?: boolean ;
    AllowToChangeInEditMode?: boolean = true;
    RowCount?: number;

    
    //Ui only
    DisplayValue?: any;
    TabName? : any;
    ExtraProperities? : any;
}

export class SaveFormConfiguration{
    //Which Api to use ( general or custom)
    UseGeneralApi?: boolean = true;

    //Custom Api Name
    ApiName?: string;

    //Api Request Method
    ApiRequestType ?: ApiRequestType;

    //Which SP to use ( general or custom)
    UseGeneralSP?: boolean = false;

    //DataDource for saving data using custom sp for general api
    DataSource?: DataSource;

    //Which URL to go to after save is successfull or close button is clicked
    AfterSaveRouteLink?: string;
}

export class FormAuditModel {
    Id?: number = 0;
    NewDetails?: string;
    OldDetails?: string;
    RowDetailsList?: RowDetails[];
    OldRowDetailsList?: RowDetails[];
    DataSourceList?: DataSource[];
    EntityRelations?: any;
    DataSourceTree?: DataSourceTreeNode;
}




// {
//     Code : 'taxcode',
//     Header : 'Add New TaxCode',
//     PageProperties : {
//       PageTitle : 'TaxCode',
//       BannerText : 'Tax-Code',
//     },
//     DataSource : {
//       Type : DataSourceType.View,
//       Name : 'TaxCode',
//       EntityType : 0,
//       IsCoreEntity : true
//     },
//     RowDetailsList : [
//       {
//         ColumnDetailsList : [
//           {
//             ColSpan : 7,
//             ElementType : ElementType.ControlElement,
//             ControlElement :{
//               Label : 'Code',
//               FieldName : 'Code',
//               PlaceHolder : 'Tax Code',
//               InputControlType : FormInputControlType.TextBox,  
//               Validators : [
//                 {
//                   Name : 'required',
//                   PropertyNameInError : 'required',
//                   InvalidMessage : 'This field is required'
//                 }
//               ],
//               ParentFields : []  
               
//             }
//           },
//           {
//             ColSpan : 5,
//             ElementType : ElementType.ControlElement,
//             ControlElement : {
//               Label : 'Status',
//               FieldName : 'Status',
//               InputControlType : FormInputControlType.CheckBox,
//               Validators : [], 
//               ParentFields : []  
//             }
//           }
//         ]
//       },
//       {
//         ColumnDetailsList : [
//           {
//             ColSpan : 12,
//             ElementType :ElementType.ControlElement,
//             ControlElement : {
//               Label : 'Description',
//               FieldName : 'Description',
//               InputControlType : FormInputControlType.TextArea,
//               Validators : [],
//               RowCount : 3,
//               ParentFields : []  
//             }
//           }
//         ]
//       },
//       {
//         ColumnDetailsList : [
//           {
//             ColSpan : 6,
//             ElementType : ElementType.GroupElement,
//             GroupElement : {
//               Label : 'Threshold',
//               Type : GroupType.HighlightedBorder,
//               RowDetailsList : [
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12 ,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Threshold Limit Applicable',
//                         InputControlType : FormInputControlType.CheckBox,
//                         FieldName : 'IsThresholdLimitApplicable',
//                         Validators : [],
//                         ParentFields : []  
//                       }
//                     }
//                   ]
//                 },
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Threshold Limit',
//                         InputControlType : FormInputControlType.TextBox,
//                         FieldName : 'ThresholdLimit',
//                         PlaceHolder : 'Limit',
//                         Validators : [],
//                         ParentFields : []  
//                       }
//                     }
//                   ]
//                 },
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Threshold Limit Senior',
//                         InputControlType : FormInputControlType.TextBox,
//                         FieldName : 'ThresholdLimitSenior',
//                         PlaceHolder : 'Senoir',
//                         Validators : [],
//                         ParentFields : []  
//                       }
//                     }
//                   ]
//                 },
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Threshold Limit Super Senior',
//                         InputControlType : FormInputControlType.TextBox,
//                         FieldName : 'ThresholdLimitSuperSenior',
//                         PlaceHolder : 'Super Senior',
//                         Validators : [],
//                         ParentFields : []  
//                       }
//                     }
//                   ]
//                 }
//               ]
//             }
//           },
//           {
//             ColSpan : 6,
//             ElementType : ElementType.GroupElement,
//             GroupElement : {
//               Type : GroupType.SimpleWithoutLabel,
//               RowDetailsList : [
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Document Proof Required',
//                         InputControlType : FormInputControlType.CheckBox,
//                         FieldName : 'IsDocumentProofMandatory',
//                         Validators : [],
//                         ParentFields : []  
//                       } 
//                     }
//                   ] 
//                 },
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Parent',
//                         InputControlType : FormInputControlType.AutoFillTextBox,
//                         DropDownList  : [0,1 ,2 ,3],
//                         FieldName : 'ParentId',
//                         Validators : [],
//                         ParentFields : []  
//                       } 
//                     }
//                   ] 
//                 },
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Display Text',
//                         InputControlType : FormInputControlType.TextBox,
//                         FieldName : 'DisplayText',
//                         PlaceHolder : 'Display Text',
//                         Validators : [],
//                         ParentFields : []  
//                       } 
//                     }
//                   ] 
//                 },
//                 {
//                   ColumnDetailsList : [
//                     {
//                       ColSpan : 12,
//                       ElementType : ElementType.ControlElement,
//                       ControlElement : {
//                         Label : 'Heading Text',
//                         InputControlType : FormInputControlType.TextBox,
//                         FieldName : 'HeadingText',
//                         PlaceHolder : 'Heading',
//                         Validators : [],
//                         ParentFields : []  
//                       } 
//                     }
//                   ] 
//                 }
//               ]
//             }
//           }
//         ]
//       }
//     ]
//   }