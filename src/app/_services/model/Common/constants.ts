
export class ApiConstants
{
    public static readonly GET_RULESETS_BY_IMPL_COMP = 'GetRuleSetsByImplementationCompanyId';
    public static readonly UPSERT_RULESET = 'UpsertRuleSet';
    public static readonly UPSERT_RULE = 'UpsertRule';
    public static readonly DELETE_RULESET = 'DeleteRuleSet';
    public static readonly GET_ALL_RULESETS = 'GetAllRulesets';
    public static readonly GET_RULES_BY_RULESET_ID = 'GetRulesByRuleSetId';
    public static readonly UPDATE_RULES_PRIORITY = 'updateRulesPriority';
   
    public static readonly GET_RULESET_BY_RULESET_ID = 'GetRuleSetWithRules';
    
    public static readonly GET_CLIENTCONTRACT_CODES_BY_CLIENTID = 'GetClientContractBaseCodesByClientId';
    public static readonly GET_CLIENT_CODES_BY_IMPL_COMPANY = 'GetClientBaseCodesByImplementationCompany';
    public static readonly GET_IMPL_COMPANY_CODES_BY_IMPLEMENTATION = 'GetImplementationCompanyCodesByImplementation';
    public static readonly GET_BUSINESSSYSTEM_CODES_BY_IMPLEMENTATION = 'GetBusinessSystemCodesByImplementation';
    
    public static readonly GET_BUSINESSSYSTEM_BY_IMPLEMENTATION = 'GetBusinessSystemByImplementationCompany';
    public static readonly GET_BUSINESSSYSTEM_BY_ID = 'GetBusinessSystemById';

    public static readonly GET_BUSINESS_SYSTEMS = 'GetBusinessSystems';
    public static readonly GET_ALL_LOOKUP_GROUPS = 'GetAllLookupGroups';
    public static readonly UPSERT_BUSINESS_SYSTEM = 'UpsertBusinessSystem';
    public static readonly DELETE_BUSINESS_SYSTEM = 'DeleteBusinessSystem';

    public static readonly GET_ACTIVE_TEMPLATE_CATEGORIES_FOR_ALL_COMPANIES = 'GetActiveTemplateCategoriesForAllCompanies';
    public static readonly GET_TEMPLATES_BY_IMPLEMENTATION = 'GetTemplatesMetadataByImplementationCompanyId';
    public static readonly UPSERT_TEMPLATE = 'UpsertTemplate';
    public static readonly GET_TEMPLATE_BY_ID = 'FetchTemplateDetailsbyId';
    
}

export class ControllerConstants
{
    public static readonly BUSINESS_SYSTEM_MANAGER = 'BSM/';
    public static readonly APPLICATION = 'Application/';
    public static readonly RULES = 'Rule/';
    public static readonly CLIENT = 'Client/';
    public static readonly COMMON = 'Common/';
    public static readonly TEMPLATE = 'api/Template/';
}

export class SessionConstants
{
    public static readonly SELECTED_COUNTRY = 'SelectedCountry';
    public static readonly SELECTED_COMPANY = 'SelectedCompany';
    public static readonly SELECTED_IMPLEMENTATION = 'SelectedImplementation';

}

export class ImplementationProperties
{
    public static readonly ADMIN_END_POINT = 'AdminAPI';
    public static readonly IMPLEMENTATION_END_POINT = 'ImplementationAPI';
    public static readonly BO_SOURCE = 'BOSource';

    public static readonly REMOTE_BO_SOURCE = 'Remote';

}