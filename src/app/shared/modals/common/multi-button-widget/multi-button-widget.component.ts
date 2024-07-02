import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MultiButtonWidget } from 'src/app/_services/model/Common/Widget';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-multi-button-widget',
  templateUrl: './multi-button-widget.component.html',
  styleUrls: ['./multi-button-widget.component.css']
})
export class MultiButtonWidgetComponent implements OnInit {
  @Input() MultiButtonWidget: MultiButtonWidget;
  constructor(
    private router: Router,
    private activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {
  }

  onNavigator(itemActivity): void {
    // this.modal_dismiss(`${itemActivity.pageNavigator == "onboardingRequest" ? "Candidate" : "Vendor"}`);   
    this.modal_dismiss(`${itemActivity.pageName}`);
    itemActivity.isNavigationRequired ? this.router.navigate([`/app/onboarding/${itemActivity.pageNavigator}`]) : true;
  }
  modal_dismiss(_actionName): void {
    this.activeModal.close(_actionName);
  }
}
