import { Component, OnInit, Input } from '@angular/core';

export interface CardConfiguration {
  RequiredCardSize: any;
  LstCardItems: CardItems[];
}
export interface CardItems {
  CardTitle?: any;
  DefaultValue?: any;
  OutputText?: any;
  IconName? : any;
  CardBodyBackgroundColor? : any;
  CardTitleColor? : any;
  CardBodyTextColor? : any;
}

@Component({
  selector: 'app-cardbar-view',
  templateUrl: './cardbar-view.component.html',
  styleUrls: ['./cardbar-view.component.scss']
})
export class CardbarViewComponent implements OnInit {

  @Input() cardConfiguration: any;

  constructor() { }

  ngOnInit() {

    console.log('cardConfiguration', this.cardConfiguration);

  }

}
