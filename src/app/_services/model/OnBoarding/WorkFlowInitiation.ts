
export class WorkFlowInitiation {
    Remarks: string;
    EntityId: number;
    EntityType: number;//11
    CompanyId: number;
    ClientContractId: number;
    ClientId: number;
    ActionProcessingStatus: number
    ImplementationCompanyId: number;
    WorkFlowAction: number// from button
    RoleId: number;
    DependentObject: {};
    UserInterfaceControlLst? : UserInterfaceControlLst ;
}

export class UserInterfaceControlLst  {

    AccessControlId: number
    AccessControlTypeName: string
    AccessControlTypePropertyId: number
    AddValue: string
    ControlName: string
    EditValue: string
    MenuId: number
    ParentControlId: number
    PropertyName:string
    PropertyType: number
    ViewValue: string
}

export interface WorkFlowInitiation {
    //ui fields

    // RoleId: number;
    // WorkFlowProcess: WorkFlowProcess;
    // WorkFlowModule: WorkFlowModule;
    // WorkFlowAction: ProcessModuleActionEnum;
    // ImplementationCompanyId: number;
    // ActionProcessingStatus: ActionProcessingStatus;
    // ClientId: number;
    // ClientContractId: number;
    // CompanyId: number;
    // EntityType: EntityType;
    // EntityId: number;        
    // IsRuleSetBased: boolean;
    // RuleId: number;
    // RuleSetId: number;
    // ActionType: ActionType;
    // Remarks: string;
    // ModuleProcessAction: ModuleProcessAction;
    // ModuleProcessTransaction: ModuleProcessTransaction;
    // ModuleProcessTransactionarchive: ModuleProcessTransactionarchive;
    // Accesscontrol: AccessControl;
    // DependentObject: string;


}
