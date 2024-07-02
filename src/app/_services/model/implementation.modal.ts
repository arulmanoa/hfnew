import {BaseModel} from './Common/BaseModel';
import {Application} from './application.model';
import {ApplicationVersion} from './applicationversion.model';
import {Company} from './company.model';
import {Country} from './country.model';

export class Implementation {
    Id: number;
    Application: Application;
    Company: Company;
    Country: Country;
    Description: string;
    ApplicationVersion:ApplicationVersion;
    //Properties: { [key: string]: any };
    //Properties: string;

}

export class TempCountryWiseImpl {
    CountryName:string;
    Implementations:Implementation[];
  constructor(){
    this.Implementations = new Array<Implementation>();
  }
}