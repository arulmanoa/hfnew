import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alert-screen',
  templateUrl: './alert-screen.component.html',
  styleUrls: ['./alert-screen.component.css']
})
export class AlertScreenComponent implements OnInit {

  @Input() invalidItems : any;
  constructor() { }

  ngOnInit() {
    console.log('invalidItems', this.invalidItems);
    
  }
  getLetterSpace(string) {
    var subString =  string.replace(/([a-z])([A-Z])/g, '$1 $2')
    return subString.charAt(0).toUpperCase() + subString.slice(1);
  }

}
