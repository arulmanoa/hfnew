import {BaseModel} from './Common/BaseModel';

export class ApplicationVersion extends BaseModel
{
    Id: number;
    Version: string;
    ReleaseDate: Date | string;
    Properties: { [key: string]: any };
}