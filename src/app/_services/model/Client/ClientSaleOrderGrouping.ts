import { SelectionOperator } from "src/app/shared/components/clientContract/invoicegroup/invoiceGroup";
import { BaseModel } from "../Common/BaseModel";
import { ProcessCategory } from "../Payroll/PayRun";

export class ClientSaleOrderGrouping extends BaseModel {

    ClientId: number;
    ClientContractId: number;
    CompanyId: number;
    ProcessCategory: ProcessCategory;
    ContainerType: PrimaryContainerType; // always payrun for now
    MaxBillAmountPerSaleOrder: number; // didnt gave an option to set this at sub-grouping level
    ListOfGroupingFieldList: SaleOrderGroupingFieldDetails[][];

}

export enum SecondaryContainerType {
    ClientContract,
    Team
}
export enum PrimaryContainerType {
    Payrun = 1,
    //TeamWithInPayrun = 2
}

export class SaleOrderGroupingFieldDetails {
    FieldName: string;
    FieldType: FieldType;
    Operator: SelectionOperator;
    FieldValues: Object[];
    SortingOrder: number;
}

export enum FieldType {
    String = 1,
    Decimal = 2
}
