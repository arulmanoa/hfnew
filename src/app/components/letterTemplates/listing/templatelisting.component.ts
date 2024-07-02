import { Component, OnInit, Injectable, ViewEncapsulation, ElementRef } from '@angular/core';
import { AngularGridInstance, Column, Editors, FieldType, Formatters, GridOption, GridService, OnEventArgs, Filters } from 'angular-slickgrid';
import { Template } from 'src/app/_services/model/template';
import { TemplateService } from 'src/app/_services/service/template.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationService } from 'src/app/_services/service/application.service';
import { Router } from '@angular/router';
import { template } from '@angular/core/src/render3';
// import {ToolbarModule} from 'primeng/toolbar';
import * as $ from 'jquery';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 

@Component({
  //styles: ['.duration-bg { background-color: #e9d4f1 !important }'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './templatelisting.component.html',
  styleUrls: ['../letterTemplate.component.css']
})

@Injectable()
export class TemplateListingComponent implements OnInit {

  templateGridInstance: AngularGridInstance;
  templateGrid: any;
  templateGridService: GridService;
  dataView: any;

  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any;
  spinner : boolean = false;
  msg: any;

  templateList: Template[];
  sessionDetails:any;
  //implementationCompanyCodeList: any[];


  currentTemplate: any;
  selectedTemplates: any[];
  defalutSmeClientId:any;
  defalutSmeClientContractId:any;
  _businessType:any
  _companyId:any;

  constructor(private templateApi: TemplateService, private elementRef: ElementRef, private applicationApi: ApplicationService, private modalService: NgbModal, private router: Router,private sessionService: SessionStorage) {
    this.currentTemplate = new Template();
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.templateGridInstance = angularGrid;
    this.dataView = angularGrid.dataView;
    this.templateGrid = angularGrid.slickGrid;
    this.templateGridService = angularGrid.gridService;

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
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      leaveSpaceForNewRows: true,
      enableFiltering: true,
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

    this.defalutSmeClientId=this.sessionService.getSessionStorage("default_SME_ClientId");
    this.defalutSmeClientContractId=this.sessionService.getSessionStorage("default_SME_ContractId");

    this.loadTemplates();
    //this.loadImplCompanyCodes();
  }

  // loadImplCompanyCodes()
  // {
  //   this.applicationApi.GetImplementationCompanyCodesByImplementation()
  //   .subscribe((data) => {
  //     this.implementationCompanyCodeList = data;
  //   },
  //     //error => this.msg = <any>error
  //   );
  // }
  ngAfterViewChecked() {
    var nodelist = this.elementRef.nativeElement.querySelectorAll('.input-group');
    // alert(nodelist.length);
    for (var indx = 0; indx < nodelist.length; indx++) {
      $(nodelist[indx]).css('margin-top', '0px');
    }
  }
  loadTemplates() {
    this.spinner = true;
    this.templateApi.getTemplatesByImplementation()
      .subscribe((data) => {
        data = JSON.parse(data as any);

        this.columnDefinitions = [
          {
            id: 'Name', name: 'Name', field: 'Name',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }
          },

          {
            id: 'Code', name: 'Code', field: 'Code',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }
            // editor: 
            // {
            //   model: Editors.longText
            // }
          },
         
          {
            id: 'TemplateCategoryCode', name: 'Category', field: 'TemplateCategoryCode',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }
          },
          {
            id: 'ClientCode', name: 'ClientCode', field: 'ClientCode',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }

          },
          {
            id: 'ClientContractCode', name: 'ContractCode', field: 'ClientContractCode',
            sortable: true,
            type: FieldType.string,
            filterable: true, filter: { model: Filters.compoundInputText }

          },
          {
            id: 'ValidFrom', name: 'ValidFrom', field: 'ValidFrom',
            formatter: Formatters.dateIso,
            sortable: true,
            type: FieldType.date
          },
          {
            id: 'ValidTill', name: 'ValidTill', field: 'ValidTill',
            formatter: Formatters.dateIso,
            sortable: true,
            type: FieldType.date
          },
          {
            id: 'LastUpdatedBy', name: 'Updated By', field: 'LastUpdatedBy',
            formatter: Formatters.dateIso,
            sortable: true,
            type: FieldType.string
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

              this.selectedTemplates = [];
              this.selectedTemplates.push(args.dataContext);
              this.editTemplate(false);
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
              if (confirm('Are you sure you want to delete this template?')) {
                this.selectedTemplates = [];
                this.selectedTemplates.push(args.dataContext);
                //this.deleteRuleSet();
                //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
              }
            }
          }
        ];
        this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
        
        this._businessType=this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType
        
        
        if (this._businessType !== 3) {
          this.columnDefinitions = this.columnDefinitions.filter((item) => item.id !== 'ClientCode'&&item.id !=='ClientContractCode');//hide the client column in the grid
          data=data.filter((item)=>item.ClientContractId==this.defalutSmeClientContractId);
        }

        try {
          this.templateList = data;
          // this.templateList.push(...data);
          this.dataset = this.templateList;
          console.log( this.templateList);
          this.spinner = false;
          //this.dataView.setItems(this.dataset);
          //this.rulesetGrid.render();
        } catch (error) {
          alert(error)
        }

        //this.rulesetGrid.setColumns(this.columnDefinitions);

      },
        error => this.msg = <any>error
      );
  }

  onSelectedRowsChanged(e, args) {
    if (Array.isArray(args.rows)) {
      this.selectedTemplates = args.rows.map(idx => {
        const item = this.templateGrid.getDataItem(idx);
        return item;
      });
    }
  }

  addTemplate() {
    this.currentTemplate = new Template();
    this.router.navigate(['/app/masters/lettertemplate', { templateId: '0' }], { skipLocationChange: true });
  }

  //   deleteRuleSet()
  //   {
  //     if (this.selectedTemplates == undefined || this.selectedTemplates.length == 0) {
  //       alert("Please select a template to delete");
  //       return;
  //     }

  //     this.rulesApi.deleteRuleSet(this.selectedRulesets[0].Id).subscribe(res => {
  //       if(res.Error == null)
  //       {
  //           alert("Ruleset deleted successfully");
  //           this.rulesetGridService.deleteDataGridItemById(this.selectedRulesets[0].Id);
  //       }
  //       else
  //       {
  //           alert(res.Error.Message);
  //           return;
  //       }

  //   });
  // }

  editTemplate(isDuplication: boolean) {

    this.currentTemplate = new Template();

    if (this.selectedTemplates == undefined || this.selectedTemplates.length == 0) {
      alert("Please select a template to edit");
      return;
    }

    if (this.selectedTemplates.length > 1) {
      alert("You can edit only one template, but have selected more then one");
      return;
    }

    this.currentTemplate = this.selectedTemplates[0];
    this.router.navigate(['/app/masters/lettertemplate', { templateId: this.currentTemplate.Id, isDup: isDuplication }], { skipLocationChange: false });

  }

  // viewRules()
  // {
  //   this.currentRuleSet = new RuleSet();

  //   if (this.selectedRulesets == undefined || this.selectedRulesets.length == 0) {
  //     alert("Please select a ruleset to view rules");
  //     return;
  //   }

  //   if (this.selectedRulesets.length > 1) {
  //     alert("Please select one ruleset to view rules, you have selected more then one");
  //     return;
  //   }

  //   this.currentRuleSet = this.selectedRulesets[0];
  //   this.router.navigate(['/home/ruleslist', {ruleset:JSON.stringify(this.currentRuleSet) }],{skipLocationChange: true});

  // }

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
