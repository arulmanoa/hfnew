export enum InputControlType 
{
    TextBox = 0,
    DropDown = 1,
    AutoFillTextBox = 2,
    MultiSelectDropDown = 3,
    CheckBox = 4,
    CommaSeparatedNumbers = 5,
    CommaSeparatedStrings = 6,
    DatePicker = 7
}
export enum DataSourceType
{
    SP = 0,
    View = 1,
    FixedValues = 2,
    ExternalAPI = 3,
    None = 4,
}

export enum SearchPanelType
{
    None,
    Panel,
    PanelWithAdvancedSearch,
    SearchBar
}

export enum DefaultLayoutType {
    Card,
    Grid,
    Excel
}

export enum ColumnType {
    Basic,
    Custom,
}

export enum RowSelectionType{
    Single = 0,
    Multiple = 1,
    None = 2
}

export enum GridButtonType
{
    ExportToExcel,
    CopyToClipboard // with / without headers
}


export enum EntityType
    {
        None = 0,
        Application = 1,
        Location = 2,
        Security = 3,
        ClientDetails = 4,
        Activity = 5,
        EmployeeDetails = 6,
        RuleSet = 7,
        LookupGroup = 8,
        Rule = 9,
        Product = 10,
        CandidateDetails = 11,
        Country = 12,
        CommunicationDetails = 13,
        Documents = 14,
        Company = 15,
        Client = 16,
        Person = 17,
        License = 18,
        Module = 19,
        TemplateCategory = 20,
        TemplateDetails = 21,
        AuthenticationConfiguration = 22,
        NetworkDetails = 23,
        UserAuthenticationActivity = 24,
        User = 25,
        UserSession = 26,
        OrganisationDetails = 27,
        BankDetails = 28,
        ProductGroup = 29,
        ProductType = 30,
        ObjectStorageDetails = 31,
        State = 32,
        District = 33,
        City = 34,
        BankBranch = 35,
        UserDetails = 36,
        GeoLocation = 37,
        SessionDetails = 38,
        ClientContract = 39,
        ClientContractBilling = 40,
        ClientContact = 41,
        ClientLocation = 42,
        GenericMaster = 43,
        CompanySettings = 44,
        MandateAssignmentDetails = 45,
        WorkFlowEngineConfiguration = 46,
        WorkFlowEngineQueueConfiguration = 47,
        PayGroup = 48,
        Notification = 49,
        ModuleProcessTransaction = 50,
        ModuleProcessActionTransaction = 51,
        ModuleProcessActionTransactionActivity = 52,
        EmployeeTransitionGroup = 53,
        MigratedCandidateDetails = 54,
        Zone = 55,
        SkillCategory = 56,
        MinimumWagesMapping = 57
}

export enum SortingDirection{
    ASC  = 0 ,
    DESC = 1
}

export enum FormatterType{
    NumberToDate = 0
}

export enum AccordianToggleType{
    hide = 0,
    show = 1
}