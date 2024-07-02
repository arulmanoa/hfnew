export class MandateStage {
    Id?: number;
    Code?: string;
    Description?: string;
    IsMandatory: number;
    Status: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
}

export const _MandateStage: MandateStage = {
    Id: 0,
    Code: '',
    Description: '',
    IsMandatory: 0,
    Status: 0,
    LastUpdatedOn: new Date,
    LastUpdatedBy: '',
};
