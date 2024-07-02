import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HeaderService } from 'src/app/_services/service/header.service';

@Component({
  selector: 'app-accessdenied',
  templateUrl: './accessdenied.component.html',
  styleUrls: ['./accessdenied.component.scss']
})
export class AccessdeniedComponent implements OnInit {

  constructor(

    private titleService: Title, 
    private headerService: HeaderService,


  ) { }

  ngOnInit() {

    // this.titleService.setTitle('Access Denied');
    this.headerService.setTitle('Access Denied');

  }

}
