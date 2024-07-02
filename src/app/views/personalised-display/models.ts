import {Column} from 'angular-slickgrid'
import {EntityType,DefaultLayoutType , InputControlType , SearchPanelType, DataSourceType, ColumnType, RowSelectionType, GridButtonType, FormatterType, AccordianToggleType} from './enums'


export class  SearchElement {
    DisplayName? : string;
    FieldName : string;
    InputControlType? : InputControlType = InputControlType.TextBox;
    Value : any = null;
    DefaultValue?: any = null;
    MultipleValues?: string[] = null;
    RelationalOperatorsRequired?: boolean;
    RelationalOperatorValue?: "="; //DEFAULT
    DataSource?: DataSource = null;
    IsIncludedInDefaultSearch?: boolean = true;
    DropDownList?: any[] = [];
    ForeignKeyColumnNameInDataset?: string = "Id";
    DisplayFieldInDataset?:string = "Name";
    GetValueFromUser? : boolean = false;
    SendElementToGridDataSource?: boolean = false;
    RefrenceFieldNameInSearchElements?: string;
    ParentFields?: string[] = null; 
    ReadOnly?: boolean = false;
    TriggerSearchOnChange?: boolean = false;
    FireEventOnChange?: boolean = false;
    IsFieldMandatory?: boolean = false;
    // constructor(private fName : string){
    //     this.FieldName = fName;
    // }
    
    ParentDependentReadOnly?: boolean[] = [];

    DataSecurityConfiguration?: DataSecurityConfiguration;
    DisplayOrder?: number = 0;
    

    //Ui only
    ParentHasValue?: boolean[] =[]; 
    DisplayValue ?: any = null;
    // used for InputControlType.DatePicker in UI only
    minDate?: any = null; 
    maxDate?: any = null;
}

export class SearchConfiguration {
    SearchElementList : SearchElement[];
    SearchPanelType : SearchPanelType ;
    ButtonIds?: number[] = null; 
    SearchButtonRequired? : boolean = true;
    ClearButtonRequired? : boolean = true;
    SaveSearchElementsLocally?: boolean = false;
    FillSearchElementsFromLocal?: boolean = false;
    IsDataLevelSecurityRequired?: boolean = false;
    SecurityKeys? : string[][];
}

export class DataSource{
    
      Type: DataSourceType;
      Name :string;
      EntityType?: number;
      IsCoreEntity?: boolean = false

}

export class PageProperties {

    PageTitle : string;
    BannerText : string;
    Header?: string;
    FieldNameForEditHeader?: string;
    IsCardLayoutRequired? : boolean;
    IsGridLayoutRequired?: boolean;
    IsDownloadExcelRequired?: boolean;
    IsDownloadPdfRequired?: boolean;
    IsExternalAPICallRequiredToDownloadFile?: boolean;
}

export const _pageProperties : PageProperties ={

    PageTitle : '',
        BannerText :'',
    Header: '',
    FieldNameForEditHeader: '',
    IsCardLayoutRequired : false,
    IsGridLayoutRequired: false,
    IsDownloadExcelRequired: false,
    IsDownloadPdfRequired: false,
    IsExternalAPICallRequiredToDownloadFile: false
}




export class PageLayout {

    Id?: number;
    Code: string;
    Description:string;

    CompanyId : number;
    ClientId : number;

    EntityType? : EntityType;

    SearchConfiguration : SearchConfiguration;

    GridConfiguration : GridConfiguration;

    PageProperties : PageProperties;

    IsReport?: boolean = false;

    Status?: boolean = true;

}

export class GridConfiguration{
    
    ColumnDefinitionList : ColumnDefinition[];
    
    IsDynamicColumns? : boolean = false;

    DataSource? : DataSource;

    ShowDataOnLoad : boolean = false;
    
    DefaultLayoutType? : DefaultLayoutType;

    
    IsMultiSelectAllowed? : boolean = false;
    IsSummaryRequired?: boolean = false;
    IsPaginationRequired: boolean = false;
    DisplayFilterByDefault? : boolean = false;
    EnableColumnReArrangement : boolean = true;
    IsColumnPickerRequired  : boolean = true;
    RowSelectionCheckBoxRequired?: boolean = false;
    RowSelectionType?: RowSelectionType = RowSelectionType.Single;

    IsGroupingEnabled? : boolean = false;
    DefaultGroupingFields? : string[] = null;

    PinnedRowCount? : number = -1;
    PinnedColumnCount? : number = -1;
    PinRowFromBottom? : boolean = false;

    ButtonList?: GridButtonType[];

    SetColumnSettingsFromLocal?: boolean = false;
    SaveColumnSettingsLocally ?: boolean = false;

}

export class SearchElementValues{
    InputFieldName : string;
    OutputFieldName : string;
    Value?: string;
    ReadOnly?: boolean = false;
}

export class DataSecurityConfiguration{
    RoleBasedConfigurationList : RoleBasedDataSecurityConfiguration[];
    IsMappedData : boolean = false;
}

export class RoleBasedDataSecurityConfiguration{
    RoleCode : string;
    RoleId?: number = 0;
    IsDataLeverSecurityRequired : boolean;
    OveridedUsers?: UserBasedDataSecurityConfiguration[];
}

export class UserBasedDataSecurityConfiguration{
    UserId : number;
    IsDataLeverSecurityRequired : boolean;
}

export class ColumnDefinition {
   
    //General Properties
    Id : number | string ;
    DisplayName: string = "";
    FieldName : string;
    
    DisplayOrder? : number;
    SortOrder?: number;

    IsSortable?: boolean = false;
    IsEditable? : boolean = false;
    IsVisible?: boolean = true;
    ShowInHeader?: boolean = true;
    
    //Filter Properties
    IsFilterable?: boolean = true;
    FilterType?: string = 'input';
    DataType?: string = '';
    IsCustomFilter ?: boolean = false;
    CustomFilterHandler ?: string = '';
    CustomFilterComponentName ?: string = '';

    // Formatter Properties
    Formatter? : string;
    IsGridFormatter? : boolean;

    EditorType?: string = 'text';

    Width? : number = 0;
    Type?: ColumnType = ColumnType.Basic; 
    
    //Grouping Properties
    SummaryRequiredInGrouping?: boolean = false;
    GroupAggregatorColumnAndType? : {
        Column : string,
        Type : string
    }[] = [];

    //Footer Properties
    IsSummarizable?: boolean = false;
    AggregatorType? : string = "";
    Params?: { 
        GroupFormatterPrefix?: string , 
        GroupFormatterSuffix?: string ,
    } = { GroupFormatterPrefix : null , GroupFormatterSuffix : null };

    Clickable?: boolean = false;
    RouteLink?: string = null;
    SendValuesToSearchElements?: boolean = false;
    SearchElementValuesList?: SearchElementValues[] = [];

    FunctionName?: string = null;
    SendDataToFunction?: boolean = false;
    FunctionDataType?: {} = {};
    FunctionData?: any[] = null;

    // UI only
    

    // constructor(fieldName : string){
    //     this.id = fieldName;
    //     this.FieldName = fieldName;
    // }
}

export class ColumnFilterSettings{
    Id : string ;
    DisplayName: string = "";
    FieldName : string;
    
    IsFiltered : boolean;
    FilterValue : any;
    Operator : string;
    
}

export class ColumnSortingSettings{
    Id : string ;
    DisplayName: string = "";
    FieldName : string;

    IsSorted : boolean;
    SortingDirection : string;
}

export class SearchBarAccordianToggle{
    Type : AccordianToggleType;
    ChangeAccordianText : boolean
}
