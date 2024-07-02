import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-benefitsclub',
  templateUrl: './benefitsclub.component.html',
  styleUrls: ['./benefitsclub.component.css']
})
export class BenefitsclubComponent implements OnInit {

  constructor() { 
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
  }

  ngOnInit() {
  }

}
