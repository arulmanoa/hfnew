import { Injectable, OnInit, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { searchIdObject } from 'src/app/_services/model/Common/SearchIdObject';
import { searchObject } from 'src/app/_services/model/Common/SearchObject';
import { SearchElement, SearchElementValues } from './models';

export interface DataInterface{
  SearchElementValuesList : SearchElementValues[];
  RowData : any;
  SearchObject? : searchObject;
  SearchIdObject? : searchIdObject;  
}

@Injectable({
  providedIn: 'root'
})
export class RowDataService implements OnInit , Resolve<DataInterface>{

  //dataInterface : DataInterface = { RowData : null};
  
  dataInterface : DataInterface = {
    SearchElementValuesList : null,
    RowData : null,
    SearchObject : null,
    SearchIdObject : null
  };
  
  resolve(route : ActivatedRouteSnapshot , state : RouterStateSnapshot) : Observable<DataInterface> | Promise<DataInterface> | DataInterface{
    return this.dataInterface;
  }
  constructor() { }

  ngOnInit(){

  }

  applyValuesTOSearchElements(searchElemetList : SearchElement[]){
    if(searchElemetList == undefined || searchElemetList == null || searchElemetList.length <= 0 ){
      return;
    }

    this.dataInterface.SearchElementValuesList.forEach(searchElementValues => {
      searchElemetList.forEach(searchElement => {
        if (searchElementValues.OutputFieldName === searchElement.FieldName) {
          searchElement.Value = searchElementValues.Value;
          searchElement.ReadOnly = searchElementValues.ReadOnly;
        }
      })
    })
  }

}
