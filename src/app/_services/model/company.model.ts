import {BaseModel} from './Common/BaseModel';

export class Company extends BaseModel
{
    Id: number;
    Code: string;
    Name: string;
    Description: string;
    IsActive: boolean;

}

export enum BusinessType
{
    InHousePayroll = 1,
    OutSourcingePayroll = 2,
    StaffingPayroll = 3
}
