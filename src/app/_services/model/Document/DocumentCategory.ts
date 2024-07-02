import { ObjectStorageDetails } from "../Candidates/ObjectStorageDetails";
import { BaseModel, UIMode } from "../Common/BaseModel";
import { EntityType } from "../Base/EntityType";

export class DocumentCategory extends BaseModel {
    code: string;
    name: string;
    description: string;
    status: number;
    properties: string;
}

export class DocumentType extends BaseModel {
    code: string;
    name: string;
    description: string;
    countryId: number;
    allowedExtensions: string;
    status: number;
}

export class ClientDocuments extends BaseModel {
    clientId: number;
    code: string;
    name: string;
    displayName: string;
    documentCategoryId: number;
    extension: string;
    isDowloadApplicable: boolean;
    isMandatorytoView: boolean;
    isSkipAllowable: boolean;
    isVisible: boolean;
    status: number;
    modetype: UIMode;
    lstClientDocumentSettings: ClientDocumentSettings[];
}

export enum TriggeringActionType {
    Login,
    Menu,
    Scheduler,
    Notification
}

export interface ClientDocumentSettings extends BaseModel {
    ClientDocumentId: number;
    versionNo: string;
    displayName: string;
    effectiveDate: string;
    allowedGroups: number[];
    excludeGroupIds: number[];
    excludeEmployeeIds: number[];
    objectStorageId: number;
    storageDetails: ObjectStorageDetails;
    validTill: string;
    displayOrder: number;
    triggeringActionType: TriggeringActionType;
    triggerActionValue: string;
    isPushNotificationRequired: boolean;
    isApplicableforFirstTimeUsers: boolean;
    triggerInstances: number;
    status: number;
    modetype: UIMode;
}

export interface EmployeeDocumentAccessTransactions extends BaseModel {
    clientDocumentId: number;
    clientDocumentSettingId: number;
    entityType: EntityType;
    entityId: number;
    employeeId: number;
    lastViewedOn: string;
    deviceName: string;
    modetype: UIMode;
}