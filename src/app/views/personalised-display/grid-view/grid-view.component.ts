import { Component, Input, OnInit, Output , EventEmitter} from '@angular/core';
import { AngularGridInstance, Column, GridOption } from 'angular-slickgrid';
import { PagelayoutService } from 'src/app/_services/service';
import { GridConfiguration } from '../models';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css']
})
export class GridViewComponent implements OnInit {

  @Input() gridConfiguration : GridConfiguration
  @Input() dataset : any[];

  @Output() onGridCreated = new EventEmitter();
  @Output() onSelectedRowsChanged = new EventEmitter();
  @Output() onCellClicked = new EventEmitter();

  columnDefinitions : Column[];
  gridOptions : GridOption;

  constructor(
    private pageLayoutService : PagelayoutService
  ) { }

  ngOnInit() {
    this.columnDefinitions =  this.pageLayoutService.setColumns(this.gridConfiguration.ColumnDefinitionList);
    this.gridOptions = this.pageLayoutService.setGridOptions(this.gridConfiguration);
  }

  ngOnChanges() {
    this.columnDefinitions =  this.pageLayoutService.setColumns(this.gridConfiguration.ColumnDefinitionList);
    this.gridOptions = this.pageLayoutService.setGridOptions(this.gridConfiguration);
  }

  gridReady(angularGrid : AngularGridInstance){
    this.onGridCreated.emit(angularGrid);
  }

  selectedRowsChanged(e){
    this.onSelectedRowsChanged.emit(e);
  }

  cellClicked(e){
    this.onCellClicked.emit(e);
  }

}
