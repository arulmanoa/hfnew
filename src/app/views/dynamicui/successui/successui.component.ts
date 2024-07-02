import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-successui',
  templateUrl: './successui.component.html',
  styleUrls: ['./successui.component.scss']
})
export class SuccessuiComponent implements OnInit {

  ActionName : string;
  constructor( private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {

        this.ActionName = atob(params["Sdx"]);

      }
    });


  }

}
