import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-resignation-history',
  templateUrl: './resignation-history.component.html',
  styleUrls: ['./resignation-history.component.css']
})
export class ResignationHistoryComponent implements OnInit {
  @Input() public data;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  isCollapsed: any;

      
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    console.log("luckydata", this.data);
    this.isCollapsed = this.data && this.data.ExitTransactionHistoryLog.map(() => false);
  }

  formateDate(originalDateString) {
  if(originalDateString==undefined){
    return "--";
  }
    let parsedDate = new Date(originalDateString);

    function getMonthAbbreviation(month) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months[month];
    }

    let formattedDate = `${parsedDate.getDate()} ${getMonthAbbreviation(
      parsedDate.getMonth()
    )} ${parsedDate.getFullYear()}`;

    return formattedDate;
  }

  closeModal() {
    this.activeModal.close(false);
  };
  toggleIcon(index){
    this.isCollapsed[index] = !this.isCollapsed[index];
  }
}
