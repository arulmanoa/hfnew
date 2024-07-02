import { ControlElement } from "../generic-form/form-models";
import { DataSource, SearchConfiguration, GridConfiguration } from "../personalised-display/models";
import { RelationWithParent } from "../generic-form/enums";
import { OneToManyInputType, DataFormat, ApiRequestType } from "./import-enums";
import { BaseModel } from "src/app/_services/model/Common/BaseModel";

export class ImportLayout extends BaseModel{
    
    Code: string;
    Name?: string;
    Description?:string = null;

    //Client and Company Specific details
    CompanyId?: number = 0; 
    ClientContractId ?: number = 0;
    ClientId?: number=0;

    //This defines th order in which the save query will be executed
    ImportTree : ImportTreeNode;

    //Main Input element List from which excel is made in C#
    ControlElementsList: ControlElement[] = [];

    //Configuration required for creating excel
    CreateExcelConfiguration?: CreateExcelConfiguration;
    
    //Configuration required for saving excel data
    SaveExcelDataConfiguration?: SaveExcelDataConfiguration

    Status?: boolean = true;
}

export class CreateExcelConfiguration{

    //DataSource For Filling Excel with default Data
    DataSource?: DataSource;

    //Search Configuration for making where clause or sp params
    SearchConfiguration?: SearchConfiguration;

    //Grid to display values before filling in
    GridConfiguration ?: GridConfiguration;

    //Fill with Data Allowed flag
    FillWithDataAllowed?: boolean = true;
    
    
}

export class SaveExcelDataConfiguration{

    //Containes the Details for all the Foreing key of tables 
    EntityRelations?: any  = {};

    //Unique identifiers for all Data Source with Many row one coumn relations
    UniqueIdentifiers?: any = {};

    //Data format required for saving
    DataFormat?: DataFormat;

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

    //Properties Before Uploading data to API
    BeforeUploadGridConfiguration ?: GridConfiguration;

    //Properties after receiving upload result from API
    DisplayDataGridAfterApiResult? : boolean = false;

    ApiResultGridConfiguration ?: GridConfiguration;
    
    ShowAlertWarningIfFailed? : boolean;

    WarningMessage ?: string ;

}

export class ImportTreeNode{

    //DataSource where the control elements have to be saved
    DataSource?: DataSource;

    //Name of the parent and children
    IsParent?: boolean = false; 
    Parent?: string; 
    Children?: ImportTreeNode[] = [];

    //Type of Relation with parent
    RelationWithParent?: RelationWithParent;
    OneToManyInputType?: OneToManyInputType;
    MaximumRowsAllowed?: number;

    //List Of Input elements
    ControlElementsList?: ControlElement[] = [];

    //Only for configuration Ui
    DataSourceList?: DataSource[];

}

