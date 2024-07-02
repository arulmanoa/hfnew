import { Component, OnInit, Injectable, ViewEncapsulation } from '@angular/core';
import { AngularGridInstance, Column, Editors, FieldType, Formatters, GridOption, GridService, OnEventArgs, Filters } from 'angular-slickgrid';
import { RuleSet } from '../../../_services/model/Ruleset';
import { RulesService } from '../../../_services/service/rules.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RulesetComponent } from './ruleset.component';
import { ApplicationService } from '../../../_services/service/application.service';
import { Router } from '@angular/router';
// import {ToolbarModule} from 'primeng/toolbar';

@Component({
  //styles: ['.duration-bg { background-color: #e9d4f1 !important }'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './rulesetlist.component.html',
  styleUrls: ['../rules.component.css']
})

@Injectable()
export class RulesetListComponent implements OnInit {

  rulesetGridInstance: AngularGridInstance;
  rulesetGrid: any;
  rulesetGridService: GridService;
  dataView: any;

  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];

  msg:any;

  rulesetList: any[];

  implementationCompanyCodeList: any[];

  // updatedObject: any;

  //add edit related variables
  currentRuleSet: any;
  selectedRulesets: any[];

  constructor(private rulesApi: RulesService, private applicationApi:ApplicationService, private modalService: NgbModal,private router: Router) {
    this.currentRuleSet = new RuleSet();
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.rulesetGridInstance = angularGrid;
    this.dataView = angularGrid.dataView;
    this.rulesetGrid = angularGrid.slickGrid;
    this.rulesetGridService = angularGrid.gridService;
   

    //this.dataView.getItemMetadata = this.updateItemMetadataForDurationOver50(this.dataView.getItemMetadata);
    // this.rulesetGrid.invalidate();
    //this.rulesetGrid.render();
  }

  ngOnInit(): void {

    this.columnDefinitions = [

     
    ];
 
    this.gridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize:true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      enablePagination:true,
      leaveSpaceForNewRows : true,
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
      datasetIdPropertyName: "Id"
    };

    this.loadRuleSets();
    this.loadImplCompanyCodes();
  }

  loadImplCompanyCodes()
  {
    this.applicationApi.GetImplementationCompanyCodesByImplementation()
    .subscribe((data) => {
      this.implementationCompanyCodeList = data;
    },
      //error => this.msg = <any>error
    );
  }

  loadRuleSets() {
    this.rulesApi.getAllRulesets()
      .subscribe((data) => {      

        this.columnDefinitions = [

          {
            id: 'Code', name: 'Code', field: 'Code',
            sortable: true,
            type: FieldType.string,
            filterable: true, 
            filter: { model: Filters.inputText }
            // editor: 
            // {
            //   model: Editors.longText
            // }
          },
          {
            id: 'Name', name: 'Name', field: 'Name',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }
            // editor: {
            //   model: Editors.text
            // },
            // onCellChange: (e: Event, args: OnEventArgs) => {
            //   alert('onCellChange directly attached to the column definition');
            //   console.log(args);
            // }
          },
          {
            id: 'ImplementationCompany', name: 'CompanyId', field: 'ImplementationCompanyId',
            sortable: true,
            type: FieldType.number,
            /*
            editor: {
              model: Editors.date
            }
            */
          },
          {
            id: 'Client', name: 'Client', field: 'ClientCode',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }
            /*
            editor: {
              model: Editors.date
            }
            */
          },
          {
            id: 'Contract', name: 'Contract', field: 'ContractCode',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }
            /*
            editor: {
              model: Editors.date
            }
            */
          },
          {
            id: 'Group', name: 'Group', field: 'GroupCode',
            type: FieldType.string,
            sortable: true
            // editor: {
            //   model: Editors.integer
            // }
          },
          
          {
            id: 'LastUpdatedOn', name: 'Last Updated', field: 'LastUpdatedOn',
            formatter: Formatters.dateIso,
            sortable: true,
            type: FieldType.date
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
    
              this.selectedRulesets = [];
              this.selectedRulesets.push(args.dataContext);
              this.editRuleSet(false);
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
              if (confirm('Are you sure you want to delete this ruleset?')) {
                this.selectedRulesets = [];
                this.selectedRulesets.push(args.dataContext);
                this.deleteRuleSet();
                //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
              }
            }
          }
        ];
     
        //this.rulesetGrid.setColumns(this.columnDefinitions);
        this.rulesetList = [];
        this.rulesetList.push(...data);
        this.dataset = this.rulesetList;
        //this.dataView.setItems(this.dataset);
        //this.rulesetGrid.render();
      },
        error => this.msg = <any>error
      );
  }

  onSelectedRowsChanged(e, args) {
    if (Array.isArray(args.rows)) {
      this.selectedRulesets = args.rows.map(idx => {
        const item = this.rulesetGrid.getDataItem(idx);
        return item;
      });
    }
  }

  addRuleSet() {
    this.currentRuleSet = new RuleSet();
    this.showModal();
  }

  deleteRuleSet()
  {
    if (this.selectedRulesets == undefined || this.selectedRulesets.length == 0) {
      alert("Please select a ruleset to delete");
      return;
    }

    this.rulesApi.deleteRuleSet(this.selectedRulesets[0].Id).subscribe(res => {
      if(res.Error == null)
      {
          alert("Ruleset deleted successfully");
          this.rulesetGridService.deleteDataGridItemById(this.selectedRulesets[0].Id);
      }
      else
      {
          alert(res.Error.Message);
          return;
      }

  });
}

  editRuleSet(toolBar: boolean) {

    this.currentRuleSet = new RuleSet();

    if (this.selectedRulesets == undefined || this.selectedRulesets.length == 0) {
      alert("Please select a ruleset to edit");
      return;
    }

    if (this.selectedRulesets.length > 1) {
      alert("You can edit only one ruleset, but have selected more then one");
      return;
    }

    this.currentRuleSet = this.selectedRulesets[0];
    this.showModal();

  }

  viewRules()
  {
    this.currentRuleSet = new RuleSet();

    if (this.selectedRulesets == undefined || this.selectedRulesets.length == 0) {
      alert("Please select a ruleset to view rules");
      return;
    }

    if (this.selectedRulesets.length > 1) {
      alert("Please select one ruleset to view rules, you have selected more then one");
      return;
    }

    this.currentRuleSet = this.selectedRulesets[0];
    this.router.navigate(['/app/masters/ruleslist', {ruleset:JSON.stringify(this.currentRuleSet) }],{skipLocationChange: true});
   
  }

  showModal() {
    const activeModal = this.modalService.open(RulesetComponent,
      {
        size: 'lg',
        //windowClass: 'hugeModal',
        backdrop: 'static',
        keyboard: false
      });
    activeModal.componentInstance.ruleset = this.currentRuleSet;
    activeModal.componentInstance.parentComponent = this;
    activeModal.componentInstance.implCompCodeList = this.implementationCompanyCodeList;

    activeModal.result.then(
      (data: any) => {
        if (data != undefined && data.Result == true) {
          if (data.Component.currentRuleSet.Id > 0) {
            let index = data.Component.rulesetList.findIndex(x => x.Id == this.currentRuleSet.Id);
            if (index == -1) {
              // data.Component.rulesetList.push(data.Object);
              // data.Component.dataset = data.Component.rulesetList;
              data.Component.rulesetGridService.addItemToDatagrid(data.Object, false);
            }
            else {
              data.Component.rulesetList[index] = data.Object;
              data.Component.dataset = data.Component.rulesetList;
              data.Component.rulesetGridService.renderGrid();
            }
            
            // data.Component.rulesetGridService.updateDataGridItem(data.Object);
            
          }
          else {
            data.Component.rulesetList.push(data.Object);
            
          }

          //this.loadBusinessSystems();
        }
      },
      (reason: any) => { });
  }

  /**
   * Change the SlickGrid Item Metadata, we will add a CSS class on all rows with a Duration over 50
   * For more info, you can see this SO https://stackoverflow.com/a/19985148/1212166
   */
  updateItemMetadataForDurationOver50(previousItemMetadata: any) {
    const newCssClass = 'duration-bg';

    return (rowNumber: number) => {
      const item = this.dataView.getItem(rowNumber);
      let meta = {
        cssClasses: ''
      };
      if (typeof previousItemMetadata === 'object') {
        meta = previousItemMetadata(rowNumber);
      }

      if (meta && item && item.duration) {
        const duration = +item.duration; // convert to number
        if (duration > 50) {
          meta.cssClasses = (meta.cssClasses || '') + ' ' + newCssClass;
        }
      }

      return meta;
    };
  }
}
