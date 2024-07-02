import { BaseModel } from "./Common/BaseModel"

export class NoDueCertificate extends BaseModel {
    
    EmployeeId: string
    NDCDepartmentId: number
    NDCDepartmentMappingId: number
    NDCStatus: NDCStatus
    RecoveryAmount : number
    RecoveryRemarks: string
    DocumentId: number
    DocumentName: string
}

export enum NDCStatus {
    'No Due' = 1,
    'Action Pending' = 2,
    'Recovery Applicable' = 3

}