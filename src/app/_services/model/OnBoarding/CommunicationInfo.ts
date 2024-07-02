export class CommunicationInfo {

  CountryList: CountryList[];
  StateList: StateList[];
  CityList: CityList[];
}

export class CountryList {

  Id: number;
  Name: string;

}

export class StateList {

  Id: number;
  Name: string;
  CountryId: number;

}

export class CityList {
Id: number;
Name: string;
StateId: number;
}