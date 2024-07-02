import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fake',
  templateUrl: './fake.component.html',
  styleUrls: ['./fake.component.css']
})
export class FakeComponent implements OnInit {

  constructor(private route : ActivatedRoute) { }

  ngOnInit() {
    console.log(this.route.snapshot.data)
  }

}
