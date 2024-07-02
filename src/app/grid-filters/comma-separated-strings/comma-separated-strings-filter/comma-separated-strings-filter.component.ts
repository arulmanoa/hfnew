import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Component({
  selector: 'app-comma-separated-strings-filter',
  templateUrl: './comma-separated-strings-filter.component.html',
  styleUrls: ['./comma-separated-strings-filter.component.css']
})
export class CommaSeparatedStringsFilterComponent implements OnInit {

  filterValue : string = '';
  separatedStrings : string[];
  onItemChanged = new Subject<string[]>();
  collection : any[];
  placeholder : string = '';
  fieldName : string = '';

  constructor() { }

  ngOnInit() {

    //  console.log("Collection ::" , this.collection , this.fieldName , this.collection[0]  , this.collection[0].fieldName );

    if(this.collection !== undefined && this.collection !== null && this.collection.length > 1){
      this.placeholder = `e.g : ${this.collection[0][this.fieldName]},${this.collection[1][this.fieldName]}`;
    }
    else{
      this.placeholder = 'e.g : 123, 456';
    }
  }


  onFilterValueChange(){

    // console.log("Filter value changed ::" , this.filterValue);

    if(this.filterValue === undefined || this.filterValue === null ||this.filterValue === ''){
      this.filterValue = '';
      this.separatedStrings = []
    }
    else{

      let inputValue : string  = this.filterValue;

      if(inputValue.startsWith(',')){
        inputValue = inputValue.substring(1);
      }

      if(inputValue.endsWith(',')){
        inputValue =  inputValue.substring(0 , inputValue.length - 1);
      }

      let inputStrings = inputValue.split(",");

      if(inputStrings === undefined || inputStrings === null || inputStrings.length <= 0){
        this.separatedStrings = [];
      }
      else{
        this.separatedStrings = [];
        inputStrings.forEach(x => this.separatedStrings.push(x.trim()));
        // this.separatedStrings = inputStrings;
        
      }

      // console.log("INput value ::" , inputValue);
    }

    // console.log("Separated string ::" , this.separatedStrings , Array.isArray(this.separatedStrings) , this.separatedStrings.length);

    this.onItemChanged.next(this.separatedStrings);
  }

  onkeyPressed(event){
    let input = (this.filterValue !== null ? this.filterValue : '') + event.key;
    let keyAllowed : boolean =  /^(([a-zA-Z0-9 ](,)?)*)+$/i.test(input);

    return keyAllowed;
    

  }

}
