import { BaseModel } from "../Common/BaseModel";
import { UIMode } from "../UIMode"; 
import { EmployeeExemptionBillDetails } from "./EmployeeTaxExemptionDetails";

export class EmployeeJourneyDetails extends BaseModel {

    EmployeeId: number;
    FinancialYearId: number;
    ProductId: number;
    TravelStartDate: Date | string | null;
    TravelEndDate: Date | string | null;
    Amount: number;
    DeclarationAcceptanceForLTABlockYear: number;
    IsAcceptanceAcknowledged: boolean;
    Status: number;
    Modetype: UIMode;
    LstEmployeeExemptionBillDetails: EmployeeExemptionBillDetails[];
    LstTravellerDetails: TravellerDetails[];
    TravellerDetails: string;
}

export class TravellerDetails {
    Id: string;
    TravellerName: string;
    TravelDateFrom: Date | string | null;
    TravelDateTo: Date | string | null;
    RelationshipType: number;
    DateOfBirth: Date | string;
    Expense: number | null;
    OtherDetails: string;
    TravelType: number | null;
    TravelReceiptDocumentId: number | null;
    TravelReceiptFileName: string;
}