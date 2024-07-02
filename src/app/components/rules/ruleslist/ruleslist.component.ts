import { Component, OnInit, ViewEncapsulation, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute,ParamMap } from '@angular/router';
import { AngularGridInstance, Column, RowMoveManager, Editors, FieldType, Formatters, GridOption, GridService, OnEventArgs, Filters } from 'angular-slickgrid';
import * as $ from 'jquery';
import { Rule } from '../../../_services/model/Rule';
import { RuleSet } from '../../../_services/model/Ruleset';
import { NgbModal,NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RulesService } from '../../../_services/service/rules.service';
import { stringFilterCondition } from 'angular-slickgrid/app/modules/angular-slickgrid/filter-conditions/stringFilterCondition';
import { RuleBuilderComponent } from '../ruleeditor/rulebuilder.component';

@Component({
  // selector: 'ruleset-app',
  templateUrl: './ruleslist.component.html',
  styleUrls: ['../rules.component.css']
})


@Injectable()
export class RulesListComponent implements OnInit {
  rulesGridInstance: AngularGridInstance;
  rulesGrid: any;
  rulesGridService: GridService;
  dataView: any;

  columnDefinitions: Column[];
  datasetOriginal: any[];
  gridOptions: GridOption;
  dataset: any[];

  ruleset:any;
  rulesList: Rule[];

  selectedRuleList:any[];
  currentRule:Rule;

  editInProgress: boolean;
  msg: string;
  
  // autoresize:AutoResizeOption={maxWidth:2000}

  constructor(private router: Router,private route: ActivatedRoute, private rulesApi: RulesService, private modalService: NgbModal) {
    this.rulesList = [];
    this.editInProgress = false;
    
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.rulesGridInstance = angularGrid;
    this.dataView = angularGrid.dataView;
    this.rulesGrid = angularGrid.slickGrid;
    this.rulesGridService = angularGrid.gridService;
  }

  addRule()
  {
    this.currentRule = new Rule();
    this.currentRule.RuleSetId = this.ruleset.Id;

    //this.router.navigate(['/home/rulebuilder']);
   
    this.showModal();
  }
 
  showModal() {
    const activeModal = this.modalService.open(RuleBuilderComponent,
      {
         //size: 'lg',
        windowClass: 'hugeModal',
        backdrop: 'static',
        keyboard: false
      });
     activeModal.componentInstance.currentRule = this.currentRule;
     activeModal.componentInstance.rulesetId = this.ruleset.Id;
     activeModal.componentInstance.parentComponent = this;
     activeModal.componentInstance.ruleSet = this.ruleset;

    // activeModal.componentInstance.implCompCodeList = this.implementationCompanyCodeList;

    activeModal.result.then(
      (data: any) => {
         if (data != undefined && data == true) 
         {
            this.loadRules();
         }

        // if (data != undefined && data.Result == true) {
        //   if (data.Component.currentRuleSet.Id > 0) {
        //     let index = data.Component.rulesetList.findIndex(x => x.Id == this.currentRuleSet.Id);
        //     if (index == -1) {
        //       // data.Component.rulesetList.push(data.Object);
        //       // data.Component.dataset = data.Component.rulesetList;
        //       data.Component.rulesetGridService.addItemToDatagrid(data.Object, false);
        //     }
        //     else {
        //       data.Component.rulesetList[index] = data.Object;
        //       data.Component.dataset = data.Component.rulesetList;
        //       data.Component.rulesetGridService.renderGrid();
        //     }
            
        //     // data.Component.rulesetGridService.updateDataGridItem(data.Object);
            
        //   }
        //   else {
        //     data.Component.rulesetList.push(data.Object);
            
        //   }

        //   //this.loadBusinessSystems();
        // }
      },
      (reason: any) => { });
  }

  editExecutionOrder() {
    this.datasetOriginal  =JSON.parse(JSON.stringify(this.dataset));

    this.editInProgress = true;
    this.columnDefinitions.unshift({
      id: '#', field: '', name: '', width: 40,
      behavior: 'selectAndMove',
      selectable: false, resizable: false,
      cssClass: 'cell-reorder dnd',
      excludeFromExport: true
    });
    // this.columnDefinitions = Object.assign({}, this.columnDefinitions);

    this.rulesGridInstance.slickGrid.setColumns(this.columnDefinitions);
    this.rulesGridInstance.slickGrid.setData(this.dataset);
    this.rulesGridInstance.slickGrid.render();
  }
  editRuleSet() {
    
  }

  saveExecutionOrder() {

    this.columnDefinitions.shift();
    this.rulesGridInstance.slickGrid.setColumns(this.columnDefinitions);    
    this.rulesGridInstance.slickGrid.setData(this.dataset);
    this.rulesGridInstance.slickGrid.render();

    var keyArray = this.dataset.map(a => ({ key: a.Id, value: a.ExecutionOrder}));

    if (window.confirm('Are you sure you want to save this execution order?')) {
      this.rulesApi.updateRulesPriority(keyArray).subscribe(res => {
        if (res.Error == null) 
        {
          alert("Execution order updated successfully");
         }
        else {
          alert(res.Error.ErrorMessage);
          this.discardChanges(false);
          return;
        }
        
      }, err => {
        alert(err);
        this.discardChanges(false);
      });
    }

    this.editInProgress = false;
  }

  discardChanges(shift: boolean = true) {
    this.dataset  =JSON.parse(JSON.stringify(this.datasetOriginal));

    if(shift)
    {
    this.columnDefinitions.shift();
    }
    this.rulesGridInstance.slickGrid.setColumns(this.columnDefinitions);    
    this.rulesGridInstance.slickGrid.setData(this.dataset);
    this.rulesGridInstance.slickGrid.render();

    this.editInProgress = false;
  }

  ngOnInit() {
    
// // this.str = this.route.snapshot.paramMap.get('ruleset');
// this.route.paramMap.subscribe(
//   (params: ParamMap) => {
//     this.str = JSON.stringify(params.get('ruleset'));
//     alert(this.str);
//   }
// )
    this.ruleset = JSON.parse(this.route.snapshot.paramMap.get('ruleset'));

    this.columnDefinitions = [
      // {
      //   id: '#', field: '', name: '', width: 40,
      //   behavior: 'selectAndMove',
      //   selectable: false, resizable: false,
      //   cssClass: 'cell-reorder dnd',
      //   excludeFromExport: true
      // },
      {
        id: 'Code', name: 'Code', field: 'Code',

        type: FieldType.string,
        filterable: true, filter: { model: Filters.compoundInputText }
      },
      {
        id: 'Name', name: 'Name', field: 'Name',

        type: FieldType.string,
        filterable: true, filter: { model: Filters.compoundInputText }
      },
      {
        id: 'Description', name: 'Description', field: 'Description',

        type: FieldType.string,
        filterable: true, filter: { model: Filters.compoundInputText }
      },
      {
        id: 'Group', name: 'Group', field: 'GroupId',
        type: FieldType.number,

        // editor: {
        //   model: Editors.integer
        // }
      },
      {
        id: 'ImplementationCompany', name: 'Implementation Company', field: 'ImplementationCompanyId',

        type: FieldType.number,
        /*
        editor: {
          model: Editors.date
        }
        */
      },
      {
        id: 'LastUpdatedOn', name: 'Last Updated', field: 'LastUpdatedOn',
        formatter: Formatters.dateIso,

        type: FieldType.date
      },
      {
        id: 'ExecutionOrder', name: 'ExecutionOrder', field: 'ExecutionOrder',
        //excludeFromHeaderMenu: true,
        //width:0
      },
      {
        id: 'edit',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.selectedRuleList = [];
          this.selectedRuleList.push(args.dataContext);
          this.editRule();
        }
      },
      {
        id: 'delete',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          // if (confirm('Are you sure you want to delete this ruleset?')) {
          //   this.selectedRulesets = [];
          //   this.selectedRulesets.push(args.dataContext);
          //   this.deleteRuleSet();
          //   //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
          // }
        }
      }
    ];


    this.gridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      enablePagination:true,
      pagination: {
        pageSizes: [10,15,25,50,75,100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id",
      enableRowMoveManager: true,
      gridMenu: {
        iconCssClass: 'fa fa-ellipsis-v',
      },
      rowMoveManager: {
        onBeforeMoveRows: (e, args) => this.onBeforeMoveRow(e, args),
        onMoveRows: (e, args) => this.onMoveRows(e, args),
      },

      presets: {
        // columns:[{ columnId: 'ExecutionOrder', cssClass:'hide'}],
        // sorters: [
        //   { columnId: 'ExecutionOrder', direction: 'ASC' }
        // ],
      }

    };

    this.dataset = [];
    this.loadRules();

  }

  editRule()
  {
    this.currentRule = new Rule();

    if (this.selectedRuleList == undefined || this.selectedRuleList.length == 0) {
      alert("Please select a rule to edit");
      return;
    }

    if (this.selectedRuleList.length > 1) {
      alert("You can edit only one rule, but have selected more then one");
      return;
    }

    this.currentRule = this.selectedRuleList[0];
    this.showModal();
  }

  onSelectedRowsChanged(e, args) {
    if (Array.isArray(args.rows)) {
      this.selectedRuleList = args.rows.map(idx => {
        const item = this.rulesGrid.getDataItem(idx);
        return item;
      });
    }
  }

  loadRules() {
    this.rulesApi.getRulesByRuleSetId(this.ruleset.Id)
    .subscribe((data) => {
      // console.log(data);
      // console.log(data[0]);
      this.rulesList = [];
      this.rulesList.push(...data);

      this.rulesList = [].slice.call(this.rulesList).sort(function(a,b){ 
        return a.ExecutionOrder - b.ExecutionOrder; 
      }); 

      // this.ruleset.sort(x=>x.ExecutionOrder);
      this.dataset = this.rulesList;
    },
      error => this.msg = <any>error
    );
    // this.rulesList.push({
    //   Id: 3, Code: 'Rule3', Description: 'Rule 3 Desc', Name: 'Rule 3', RulesetId: 1, ExecutionOrder: 1, Status: 1,
    //   Properties: '', FormattedPhrase: '', HtmlData: '', ImplementationCompanyId: 0, GroupId: 0, CreatedBy: '', CreatedOn: new Date('2019-03-01'),
    //   LastUpdatedBy: '', LastUpdatedOn: new Date('2019-03-01')
    // })

    // this.rulesList.push({
    //   Id: 1, Code: 'Rule1', Description: 'Rule1Desc', Name: 'Rule 1', RulesetId: 1, ExecutionOrder: 2, Status: 1,
    //   Properties: '', FormattedPhrase: '', HtmlData: '', ImplementationCompanyId: 0, GroupId: 0, CreatedBy: '', CreatedOn: new Date('2019-03-01'),
    //   LastUpdatedBy: '', LastUpdatedOn: new Date('2019-03-01')
    // });

    // this.rulesList.push({
    //   Id: 2, Code: 'Rule2', Description: 'Rule 2 Desc', Name: 'Rule 2', RulesetId: 1, ExecutionOrder: 3, Status: 1,
    //   Properties: '', FormattedPhrase: '', HtmlData: '', ImplementationCompanyId: 0, GroupId: 0, CreatedBy: '', CreatedOn: new Date('2019-03-01'),
    //   LastUpdatedBy: '', LastUpdatedOn: new Date('2019-03-01')
    // });




    //this.dataset = this.rulesList;
  }

  onBeforeMoveRow(e, data) {
    for (let i = 0; i < data.rows.length; i++) {
      // no point in moving before or after itself
      if (data.rows[i] === data.insertBefore || data.rows[i] === data.insertBefore - 1) {
        e.stopPropagation();
        return false;
      }
    }
    return true;
  }

  onMoveRows(e, args) {
    const extractedRows = [];
    let left;
    let right;
    const rows = args.rows;
    const insertBefore = args.insertBefore;
    left = this.dataset.slice(0, insertBefore);
    right = this.dataset.slice(insertBefore, this.dataset.length);
    rows.sort((a, b) => {
      return a - b;
    });

    for (let i = 0; i < rows.length; i++) {
      extractedRows.push(this.dataset[rows[i]]);
    }

    rows.reverse();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row < insertBefore) {
        left.splice(row, 1);
      } else {
        right.splice(row - insertBefore, 1);
      }
    }
    this.dataset = left.concat(extractedRows.concat(right));
    const selectedRows = [];

    for (let i = 0; i < rows.length; i++) {
      selectedRows.push(left.length + i);
    }

    for (let indx = 0; indx < this.dataset.length; indx++) {
      this.dataset[indx].ExecutionOrder = indx + 1;
    }

    this.rulesGridInstance.slickGrid.resetActiveCell();
    this.rulesGridInstance.slickGrid.setData(this.dataset);
    this.rulesGridInstance.slickGrid.setSelectedRows(selectedRows);
    this.rulesGridInstance.slickGrid.render();
  }

}

