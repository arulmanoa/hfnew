import { Component, OnInit, Type } from '@angular/core';
import { FormLayout, RowDetails, ControlElement, FormAuditModel, DataSourceTreeNode } from '../form-models';
import { FormInputControlType, GroupType, ElementType, RelationWithParent } from '../enums';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/_services/service/header.service';
import { Title } from '@angular/platform-browser';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { DataSourceType } from '../../personalised-display/enums';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { RowDataService } from '../../personalised-display/row-data.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import Swal from 'sweetalert2';
import { AngularGridInstance } from 'angular-slickgrid';
import { DataSource, SearchElement, ColumnDefinition } from '../../personalised-display/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericFormUiModalComponent } from 'src/app/shared/modals/generic-form-modals/generic-form-ui-modal/generic-form-ui-modal.component';
import { FormLayoutService } from 'src/app/_services/service/form-layout.service';
import { ApiRequestType } from '../../generic-import/import-enums';
import _ from 'lodash';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from '../../../_services/service//session-storage.service';
@Component({
  selector: 'app-form-ui',
  templateUrl: './form-ui.component.html',
  styleUrls: ['./form-ui.component.scss']
})
export class FormUiComponent implements OnInit {

  //General
  code: string;
  formLayout: FormLayout;
  genericForm: FormGroup;
  formAuditModel: FormAuditModel;
  formObject: any;
  defaultFormObject: any;
  spinner: boolean = false;
  oldRowDetailsList: RowDetails[];
  formData: any;
  _loginSessionDetails: LoginResponses;

  //editing
  editing: boolean = false;
  id: number;

  //Save
  submitted: boolean = false;

  database: FormLayout[] = [
    {
      Code: 'employeerateset',
      PageProperties: {
        PageTitle: 'Employee RateSet',
        BannerText: 'RateSet',
        Header: 'Add New RateSet',
      },
      // DataSource : {
      //   Type : DataSourceType.View,
      //   Name : 'EmployeeRateset',
      //   IsCoreEntity : false
      // },
      // DataSourceList :[
      //   {
      //     Type : DataSourceType.View,
      //     Name : 'EmployeeRateset',
      //     IsCoreEntity : false
      //   },
      //   {
      //     Type : DataSourceType.View,
      //     Name : 'RatesetProduct',
      //     IsCoreEntity : false
      //   }
      // ],
      DataSourceTree: {
        DataSource: {
          Type: DataSourceType.View,
          Name: 'EmployeeRateset',
          IsCoreEntity: false
        },
        RelationWithParent: RelationWithParent.None,
        RowDetailsList: [
          {
            ColumnDetailsList: [
              {
                ColSpan: 6,
                ElementType: ElementType.ControlElement,
                ControlElement: {
                  Label: 'Employee Id',
                  FieldName: 'EmployeeId',
                  PlaceHolder: 'Employee',
                  InputControlType: FormInputControlType.TextBox,
                  Value: null,
                  Validators: [
                    {
                      Name: 'required',
                      PropertyNameInError: 'required',
                      InvalidMessage: 'This field is required'
                    }
                  ],
                  ParentFields: [],
                  EntityList: ['EmployeeRateset']
                }
              },
              {
                ColSpan: 6,
                ElementType: ElementType.ControlElement,
                ControlElement: {
                  Label: 'Monthly Salary',
                  FieldName: 'MonthlySalary',
                  PlaceHolder: 'Salary',
                  InputControlType: FormInputControlType.TextBox,
                  Value: null,
                  Validators: [
                    {
                      Name: 'required',
                      PropertyNameInError: 'required',
                      InvalidMessage: 'This field is required'
                    }
                  ],
                  ParentFields: [],
                  EntityList: ['EmployeeRateset']
                }
              }
            ]
          },
        ],
        Children: [
          {
            DataSource: {
              Type: DataSourceType.View,
              Name: 'RatesetProduct',
              IsCoreEntity: false
            },
            GridConfiguration: {
              ColumnDefinitionList: [
                //{ Id: 'id', DisplayName: 'ID', FieldName: 'id', IsSortable: true, IsFilterable : true , IsSummarizable : true, AggregatorType : "average",   Params : { GroupFormatterPrefix : "<strong>Avg: </strong>"} },
                { Id: 'ProductCode', DisplayName: 'ProductCode', FieldName: 'ProductCode', IsSortable: true, IsFilterable: true, IsSummarizable: false, SummaryRequiredInGrouping: false, AggregatorType: "sum", Params: { GroupFormatterPrefix: "<strong>Total: </strong>", GroupFormatterSuffix: " USD" }, GroupAggregatorColumnAndType: [] },
                { Id: 'DisplayName', DisplayName: 'DisplayName', FieldName: 'DisplayName', IsSortable: true, IsFilterable: false, SummaryRequiredInGrouping: false, GroupAggregatorColumnAndType: [], Clickable: true, RouteLink: 'app/fakeLink' },
                { Id: 'value', DisplayName: 'value', FieldName: 'value', IsSortable: true, IsFilterable: true },
                { Id: 'edit', DisplayName: '', FieldName: 'Id', Clickable: true, Width: 30, RouteLink: '', FunctionName: '' }
              ],

              ShowDataOnLoad: true,
              IsPaginationRequired: false,
              DisplayFilterByDefault: false,
              EnableColumnReArrangement: true,
              IsColumnPickerRequired: true,

              IsSummaryRequired: true,
              IsGroupingEnabled: false,
              DefaultGroupingFields: [],
              PinnedRowCount: -1,
              PinnedColumnCount: -1,
              PinRowFromBottom: true,

            },
            RelationWithParent: RelationWithParent.OnetoMany,
            Header: "Rate Set",
            RowDetailsList: [
              {
                ColumnDetailsList: [
                  {
                    ColSpan: 6,
                    ElementType: ElementType.ControlElement,
                    ControlElement: {
                      Label: 'Product Code',
                      FieldName: 'ProductCode',
                      PlaceHolder: 'Code',
                      InputControlType: FormInputControlType.TextBox,
                      Value: null,
                      Validators: [
                        {
                          Name: 'required',
                          PropertyNameInError: 'required',
                          InvalidMessage: 'This field is required'
                        }
                      ],
                      ParentFields: [],
                      EntityList: ['RatesetProduct']
                    }
                  },
                  {
                    ColSpan: 6,
                    ElementType: ElementType.ControlElement,
                    ControlElement: {
                      Label: 'Display Name',
                      FieldName: 'DisplayName',
                      PlaceHolder: 'Name',
                      InputControlType: FormInputControlType.TextBox,
                      Value: null,
                      Validators: [
                        {
                          Name: 'required',
                          PropertyNameInError: 'required',
                          InvalidMessage: 'This field is required'
                        }
                      ],
                      ParentFields: [],
                      EntityList: ['RatesetProduct']
                    }
                  },
                ]
              }
            ],
            Children: []
          }
        ]
      },
      //Describing foreign key mapping for different tables
      EntityRelations: {
        'RatesetProduct': {
          'EmployeeRateset': {
            'Id': 'EmployeeRatesetId'
          }
        },
      },
      SaveConfiguration: {

      }
      // RowDetailsList : [
      // ]
    },
    {// Tax Code
      Id: 2,
      Code: 'TaxCode',
      PageProperties: {
        PageTitle: 'TaxCode',
        BannerText: 'Tax-Code',
        Header: 'Add New TaxCode'
      },
      // DataSource : {
      //   Type : DataSourceType.View,
      //   Name : 'TaxCode',
      //   EntityType : 0,
      //   IsCoreEntity : true
      // },
      EntityRelations: {},
      DataSourceTree: {
        DataSource: {
          Type: DataSourceType.View,
          Name: 'TaxCode',
          EntityType: 0,
          IsCoreEntity: true
        },
        RelationWithParent: RelationWithParent.None,
        RowDetailsList: [
          {
            ColumnDetailsList: [
              {
                ColSpan: 7,
                ElementType: ElementType.ControlElement,
                ControlElement: {
                  Label: 'Code',
                  FieldName: 'Code',
                  PlaceHolder: 'Tax Code',
                  InputControlType: FormInputControlType.TextBox,
                  Validators: [
                    {
                      Name: 'required',
                      PropertyNameInError: 'required',
                      InvalidMessage: 'This field is required'
                    }
                  ],
                  ParentFields: [],
                  EntityList: ['TaxCode'],
                }
              },
              {
                ColSpan: 5,
                ElementType: ElementType.ControlElement,
                ControlElement: {
                  Label: 'Status',
                  FieldName: 'Status',
                  InputControlType: FormInputControlType.CheckBox,
                  Validators: [],
                  EntityList: ['TaxCode'],
                  ParentFields: []
                }
              }
            ]
          },
          {
            ColumnDetailsList: [
              {
                ColSpan: 12,
                ElementType: ElementType.ControlElement,
                ControlElement: {
                  Label: 'Description',
                  FieldName: 'Description',
                  InputControlType: FormInputControlType.TextArea,
                  Validators: [],
                  RowCount: 3,
                  EntityList: ['TaxCode'],
                  ParentFields: []
                }
              }
            ]
          },
          {
            ColumnDetailsList: [
              {
                ColSpan: 6,
                ElementType: ElementType.GroupElement,
                GroupElement: {
                  Label: 'Threshold',
                  Type: GroupType.HighlightedBorder,
                  RowDetailsList: [
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Threshold Limit Applicable',
                            InputControlType: FormInputControlType.CheckBox,
                            FieldName: 'IsThresholdLimitApplicable',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    },
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Threshold Limit',
                            InputControlType: FormInputControlType.TextBox,
                            FieldName: 'ThresholdLimit',
                            PlaceHolder: 'Limit',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    },
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Threshold Limit Senior',
                            InputControlType: FormInputControlType.TextBox,
                            FieldName: 'ThresholdLimitSenior',
                            PlaceHolder: 'Senoir',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    },
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Threshold Limit Super Senior',
                            InputControlType: FormInputControlType.TextBox,
                            FieldName: 'ThresholdLimitSuperSenior',
                            PlaceHolder: 'Super Senior',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                ColSpan: 6,
                ElementType: ElementType.GroupElement,
                GroupElement: {
                  Type: GroupType.SimpleWithoutLabel,
                  RowDetailsList: [
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Document Proof Required',
                            InputControlType: FormInputControlType.CheckBox,
                            FieldName: 'IsDocumentProofMandatory',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    },
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Parent',
                            InputControlType: FormInputControlType.AutoFillTextBox,
                            DropDownList: [],
                            DataSource: {
                              Type: DataSourceType.SP,
                              Name: 'GetTaxCodeParentIds',
                              IsCoreEntity: true
                            },
                            LoadDataOnPageLoad: true,
                            DisplayField: 'Code',
                            ValueField: 'Id',
                            FieldName: 'ParentId',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: ['Id']
                          }
                        }
                      ]
                    },
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Display Text',
                            InputControlType: FormInputControlType.TextBox,
                            FieldName: 'DisplayText',
                            PlaceHolder: 'Display Text',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    },
                    {
                      ColumnDetailsList: [
                        {
                          ColSpan: 12,
                          ElementType: ElementType.ControlElement,
                          ControlElement: {
                            Label: 'Heading Text',
                            InputControlType: FormInputControlType.TextBox,
                            FieldName: 'HeadingText',
                            PlaceHolder: 'Heading',
                            Validators: [],
                            EntityList: ['TaxCode'],
                            ParentFields: []
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ],
        Children: []
      },
      SaveConfiguration: {
        UseGeneralApi: true,
      }
      // RowDetailsList : []
    },
    {//Team
      Id: 3,
      Code: 'Test-Team',
      PageProperties: {
        PageTitle: "Teams",
        BannerText: "Teams",
        Header: "Add Team",
        FieldNameForEditHeader: null,
        IsCardLayoutRequired: false,
        IsGridLayoutRequired: false
      },
      EntityRelations: {
        "Team": {
          "ClientContract": { "Id": "ClientContractId" }
        }
      },
      DataSourceTree: {
        DataSource: {
          Type: DataSourceType.View,
          Name: "ClientContract",
          EntityType: 0,
          IsCoreEntity: false
        },
        IsParent: true,
        Parent: null,
        RelationWithParent: RelationWithParent.None,
        RowDetailsList: [],
        GridConfiguration: null,
        Children: [
          {
            DataSource: {
              Type: DataSourceType.View,
              Name: "Team",
              EntityType: 0,
              IsCoreEntity: false
            },
            IsParent: false,
            Parent: "ClientContract",
            RelationWithParent: RelationWithParent.OnetoMany,
            RowDetailsList: [
              {
                ColumnDetailsList: [
                  {
                    ColSpan: 6,
                    ElementType: ElementType.ControlElement,
                    ControlElement: {
                      Label: "Code",
                      FieldName: "Code",
                      InputControlType: FormInputControlType.TextBox,
                      PlaceHolder: null,
                      Value: null,
                      EntityList: [],
                      ParentFields: [],

                    },

                  },
                  {
                    ColSpan: 6,
                    ElementType: ElementType.ControlElement,
                    ControlElement: {
                      Label: "Name",
                      FieldName: "Name",
                      InputControlType: FormInputControlType.TextBox,
                      PlaceHolder: "Designation",
                      Value: null,
                      ParentFields: [],
                      EntityList: [],

                    },

                  }
                ],

              }
            ],
            GridConfiguration: {
              "ColumnDefinitionList": [
                {
                  "Id": "Code",
                  "FieldName": "Code",
                  "DisplayName": "Code",
                  "DisplayOrder": 1,
                  "SortOrder": 0,
                  "Type": 0,
                  "IsSortable": false,
                  "IsEditable": false,
                  "IsVisible": true,
                  "ShowInHeader": true,
                  "IsFilterable": true,
                  "FilterType": "input",
                  "EditorType": "text",
                  "Width": 0,
                  "DataType": "",
                  "IsSummarizable": false,
                  "AggregatorType": "",
                  "Params": { "GroupFormatterPrefix": null, "GroupFormatterSuffix": null },
                  "SummaryRequiredInGrouping": false,
                  "GroupAggregatorColumnAndType": [],
                  "Clickable": false,
                  "RouteLink": null,
                  "SendValuesToSearchElements": false,
                  "SearchElementValuesList": [],
                  "FunctionName": null,
                  "SendDataToFunction": false,
                  "FunctionDataType": {},
                  "FunctionData": null
                },
                {
                  "Id": "Name",
                  "FieldName": "Name",
                  "DisplayName": "Name",
                  "DisplayOrder": 2,
                  "SortOrder": 0,
                  "Type": 0,
                  "IsSortable": false,
                  "IsEditable": false,
                  "IsVisible": true,
                  "ShowInHeader": true,
                  "IsFilterable": true,
                  "FilterType": "input",
                  "EditorType": "text",
                  "Width": 0,
                  "DataType": "",
                  "IsSummarizable": false,
                  "AggregatorType": "",
                  "Params": {
                    "GroupFormatterPrefix": null, "GroupFormatterSuffix": null
                  },
                  "SummaryRequiredInGrouping": false,
                  "GroupAggregatorColumnAndType": [],
                  "Clickable": false, "RouteLink": null,
                  "SendValuesToSearchElements": false,
                  "SearchElementValuesList": [],
                  "FunctionName": null,
                  "SendDataToFunction": false,
                  "FunctionDataType": {},
                  "FunctionData": null
                },
                {
                  "Id": "PayGroupId",
                  "FieldName": "PayGroupId",
                  "DisplayName": "PayGroup Id",
                  "DisplayOrder": 3,
                  "SortOrder": 0, "Type": 0,
                  "IsSortable": false,
                  "IsEditable": false,
                  "IsVisible": true,
                  "ShowInHeader": true,
                  "IsFilterable": true,
                  "FilterType": "input",
                  "EditorType": "text",
                  "Width": 0,
                  "DataType": "",
                  "IsSummarizable": false,
                  "AggregatorType": "",
                  "Params": { "GroupFormatterPrefix": null, "GroupFormatterSuffix": null },
                  "SummaryRequiredInGrouping": false,
                  "GroupAggregatorColumnAndType": [],
                  "Clickable": false,
                  "RouteLink": null,
                  "SendValuesToSearchElements": false,
                  "SearchElementValuesList": [],
                  "FunctionName": null,
                  "SendDataToFunction": false,
                  "FunctionDataType": {},
                  "FunctionData": null
                },
                { Id: 'edit', DisplayName: '', FieldName: 'Id', Clickable: true, Width: 30, RouteLink: '', FunctionName: '' }

              ],
              "IsDynamicColumns": false,
              "DataSource": null,
              "ShowDataOnLoad": false,
              "DefaultLayoutType": 0,
              "IsMultiSelectAllowed": false,
              "ButtonList": null,
              "DisplayFilterByDefault": false,
              "IsSummaryRequired": false,
              "IsGroupingEnabled": false,
              "DefaultGroupingFields": null,
              "IsPaginationRequired": false,
              "IsColumnPickerRequired": true,
              "EnableColumnReArrangement": true,
              "RowSelectionCheckBoxRequired": false,
              "RowSelectionType": 0,
              "PinnedRowCount": -1, "PinnedColumnCount": -1,
              "PinRowFromBottom": false
            },
            Children: [],

          },

        ],
      },
      SaveConfiguration: {
        UseGeneralApi: false,
        ApiName: '',
        ApiRequestType: ApiRequestType.post,

      }
    }
  ]

  constructor(
    private titleService: Title,
    private headerService: HeaderService,
    private pageLayoutService: PagelayoutService,
    private formLayoutService: FormLayoutService,
    private route: ActivatedRoute,
    private router: Router,
    private rowDataService: RowDataService,
    public modalService: NgbModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
  ) {


    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;               // Gecko, WebKit, Chrome <34 
    });



  }

  ngOnInit() {

    // * Uncomment to Upload Form import configuration
    // #region For Uploading configuration 
    // this.formLayoutService.postFormLayout(this.database.find((x) => 
    // { return x.Code == "Test-Team"})).subscribe( data => {
    //   console.log(data);
    //   if(data.Status){
    //     this.alertService.showSuccess("Form Layout added successfully!");
    //   }
    //   else{
    //     this.alertService.showWarning(data.Message);
    //   }
    // } , error => {
    //   console.error(error);
    //   this.alertService.showWarning("Error Occured while saving Form layout!");
    // })
    //#endregion
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.code = params.get('code')
      this.getFormLayout(this.code);
    })
    console.log("Form ::", this.code);

    //Please Comment Everything Below this and uncomment everything above this for dynamic loading of formlayout!
    // this.formLayout = this.database[1]; 
    // this.titleService.setTitle(this.formLayout.PageProperties.PageTitle);
    // this.headerService.setTitle(this.formLayout.PageProperties.BannerText);
    // this.formObject = {};
    // this.insertControlElementsIntoObj(this.formObject , this.formLayout.DataSourceTree.RowDetailsList);
    // console.log(this.formObject);
    // this.formObject['Id'] = new FormControl(0);
    // this.genericForm = new FormGroup(this.formObject);
    // this.defaultFormObject = this.genericForm.value;
    // console.log(this.genericForm);
    // console.log(this.defaultFormObject);

    // this.setGridForChildElements();
    // // this.editForm();

    // this.route.data.subscribe(data => {
    //   if(data.DataInterface.RowData){
    //     console.log(data.DataInterface.RowData.Id);
    //     this.id =data.DataInterface.RowData.Id;
    //     this.editForm();
    //   }
    //   else{
    //     this.id = 0;
    //     this.oldRowDetailsList = JSON.parse(JSON.stringify(this.formLayout.DataSourceTree.RowDetailsList));
    //     this.checkForOnPageLoad(this.formLayout.DataSourceTree.RowDetailsList);
    //   }

    //   this.rowDataService.dataInterface = {
    //     SearchElementValuesList : [],
    //     RowData : null
    //   } 
    // });


  }

  getFormLayout(code: string) {
    this.formLayout = null;
    this.spinner = true;
    this.id = 0;
    this.titleService.setTitle('Loading');
    this.headerService.setTitle('');
    this.formLayoutService.getFormLayout(code).subscribe(data => {
      this.spinner = false;
      console.log("Form Result", data);
      if (data.Status === true && data.dynamicObject != null) {
        this.formLayout = data.dynamicObject;
        console.log("Form Layout ::", this.formLayout);
        //Set Title

        if (this.formLayout == undefined || this.formLayout == null) {
          this.router.navigate(["app/dashboard"]);
          return;
        }

        if (this.formLayout.PageProperties !== undefined && this.formLayout.PageProperties !== null) {
          this.titleService.setTitle(this.formLayout.PageProperties.PageTitle);
          this.headerService.setTitle(this.formLayout.PageProperties.BannerText);
        }

        //Generate Form
        this.formObject = {};
        this.insertControlElementsIntoObj(this.formObject, this.formLayout.DataSourceTree.RowDetailsList);
        console.log('formObject -->', this.formObject);
        this.formObject['Id'] = new FormControl(0);
        this.genericForm = new FormGroup(this.formObject);
        this.defaultFormObject = this.genericForm.getRawValue();
        console.log('genericForm -->', this.genericForm);
        console.log('defaultFormObject -->', this.defaultFormObject);

        //Check For Readonly Elements
        this.checkForReadOnly(this.formLayout.DataSourceTree.RowDetailsList);

        //Set Grid for One to Many relation child
        this.setGridForChildElements();
        // this.editForm();

        //check For Edit Id 
        this.route.data.subscribe(data => {
          if (data.DataInterface.RowData) {
            console.log(data.DataInterface.RowData.Id);
            this.id = data.DataInterface.RowData.Id;
            this.editForm();
          }
          else {
            this.id = 0;
            this.oldRowDetailsList = JSON.parse(JSON.stringify(this.formLayout.DataSourceTree.RowDetailsList));
          }

          this.rowDataService.dataInterface = {
            SearchElementValuesList: [],
            RowData: null
          }
        });
      }



    }, error => {
      this.spinner = false;
      console.log(error);
      this.alertService.showWarning("Couldn't load form! Unknown Error Occured");
    })
  }

  setGridForChildElements() {
    for (let child of this.formLayout.DataSourceTree.Children) {
      if (child.RelationWithParent === RelationWithParent.OnetoMany) {
        child.Columns = this.pageLayoutService.setColumns(child.GridConfiguration.ColumnDefinitionList);
        child.GridOptions = this.pageLayoutService.setGridOptions(child.GridConfiguration);
        child.GridOptions = {
          datasetIdPropertyName: 'id'
        }
      }
    }
  }

  editForm() {
    this.editing = true;
    this.spinner = true;
    //this.id.toString();
    // this.id=1;
    this.pageLayoutService.getDataset(this.formLayout.DataSourceTree.DataSource, [{ FieldName: 'Id', Value: this.id.toString() }])
      .subscribe(
        data => {
          this.spinner = false;
          console.log(data);
          if (data.Status == true && data.dynamicObject !== null && data.dynamicObject !== '') {

            let formData = JSON.parse(data.dynamicObject);
            formData = formData[0];
            console.log(formData);
            this.formData = formData;

            this.genericForm.patchValue(formData);
            this.checkForOnPageLoad(this.formLayout.DataSourceTree.RowDetailsList);

            // delete formData['Id']
            this.formAuditModel = {
              OldDetails: JSON.stringify(formData),
              NewDetails: JSON.stringify(formData),
              Id: this.id,
              RowDetailsList: null,
              //DataSourceList : this.formLayout.DataSourceList,
              EntityRelations: this.formLayout.EntityRelations,
              //OldRowDetailsList : this.formLayout.RowDetailsList
            }

            this.oldRowDetailsList = JSON.parse(JSON.stringify(this.formLayout.DataSourceTree.RowDetailsList));

            let searchElements: {
              FieldName: string,
              Value: string
            }[] = [];

            for (let child of this.formLayout.DataSourceTree.Children) {
              searchElements = [];
              for (let parent of Object.keys(this.formLayout.EntityRelations[child.DataSource.Name])) {
                for (let key of Object.keys(this.formLayout.EntityRelations[child.DataSource.Name][parent])) {
                  console.log(parent, key);
                  searchElements.push({
                    FieldName: this.formLayout.EntityRelations[child.DataSource.Name][parent][key],
                    Value: this.genericForm.getRawValue()[key]
                  })
                }
              }
              this.getDataset(child, child.DataSource, searchElements);
            }

          }
          else {
            console.log(data);
          }
        }, error => {
          this.spinner = false;
          console.log(error);
        });
  }


  getDataset(treeNode: DataSourceTreeNode, dataSource: DataSource, searchElements: SearchElement[] = null) {
    this.spinner = true;
    this.pageLayoutService.getDataset(dataSource, searchElements).subscribe(
      data => {
        this.spinner = false;
        if (data.Status == true && data.dynamicObject !== null && data.dynamicObject !== '') {
          treeNode.Dataset = JSON.parse(data.dynamicObject);

          if (treeNode.Dataset != undefined && treeNode.Dataset != null && treeNode.Dataset.length > 0) {
            for (let i = 0; i < treeNode.Dataset.length; ++i) {
              treeNode.Dataset[i].id = i;
              if (treeNode.Dataset[i].hasOwnProperty('Status')) {
                treeNode.Dataset[i]['Status'] = treeNode.Dataset[i]['Status'] == 0 ? "In-Active" : "Active";
              }
            }
          }

          // treeNode.Dataset.forEach(element => {
          //   element["Status"] = element.Status == 0 ? "In-Active" : "Active";
          // });
        }
        else {
          console.log('Sorry! Could not Fetch Data |', data);
        }
      },
      error => {
        this.spinner = false;
        console.log(error);
      }
    )

  }


  // insertControlElementsIntoObj(obj : {} , rowDetailsList : RowDetails[]){
  //   for(let rowDetails of rowDetailsList){
  //     if(rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0){
  //       for(let columnDetails of rowDetails.ColumnDetailsList){

  //         if(columnDetails.ElementType == ElementType.ControlElement){
  //           if(columnDetails.ControlElement.Validators !== null && columnDetails.ControlElement.Validators.length > 0){
  //             let validators : any[] = [];  
  //             for(let validator of columnDetails.ControlElement.Validators){
  //               validators.push(Validators[validator.Name]);
  //             }
  //             obj[columnDetails.ControlElement.FieldName] = new FormControl(null , validators);
  //           }
  //           else {
  //             obj[columnDetails.ControlElement.FieldName] = new FormControl(null);
  //           }

  //           if(columnDetails.ControlElement.InputControlType == FormInputControlType.AutoFillTextBox || columnDetails.ControlElement.InputControlType == FormInputControlType.MultiSelectDropDown || columnDetails.ControlElement.InputControlType === FormInputControlType.DropDown){
  //             if(columnDetails.ControlElement.LoadDataOnPageLoad){
  //                 this.getDropDownList(columnDetails.ControlElement)
  //             }
  //           }
  //         }

  //         else{
  //           if(columnDetails.GroupElement.IsNestedGroup){
  //             let tempObj = {};
  //             this.insertControlElementsIntoObj(tempObj , columnDetails.GroupElement.RowDetailsList);
  //             obj[columnDetails.GroupElement.FieldName] = new FormGroup(tempObj);
  //           }
  //           else{
  //             this.insertControlElementsIntoObj(obj , columnDetails.GroupElement.RowDetailsList);
  //           }
  //         }
  //       }
  //     }

  //   }
  // }

  insertControlElementsIntoObj(obj: {}, rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {

          if (columnDetails.ElementType == ElementType.ControlElement) {
            if (columnDetails.ControlElement.Validators !== null && columnDetails.ControlElement.Validators.length > 0) {
              let validators: any[] = [];
              for (let validator of columnDetails.ControlElement.Validators) {
                validators.push(Validators[validator.Name]);
              }
              obj[columnDetails.ControlElement.FieldName] = new FormControl(null, validators);
            }
            else {
              obj[columnDetails.ControlElement.FieldName] = new FormControl(null);
              const businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
              if (businessType == 3 && this.id == 0 && columnDetails.ControlElement.FieldName == 'IsMustorRollApplicable') {
                columnDetails.ControlElement.Value = 'true';
                console.log('IsMustorRollApplicable OBJ', columnDetails.ControlElement);
              }
            }


          }

          else {
            this.insertControlElementsIntoObj(obj, columnDetails.GroupElement.RowDetailsList);
          }

        }
      }
    }
  }

  checkForOnPageLoad(rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {
          if (columnDetails.ElementType == ElementType.ControlElement) {
            if (columnDetails.ControlElement.InputControlType == FormInputControlType.AutoFillTextBox
              || columnDetails.ControlElement.InputControlType == FormInputControlType.MultiSelectDropDown
              || columnDetails.ControlElement.InputControlType === FormInputControlType.DropDown) {
              if (columnDetails.ControlElement.LoadDataOnPageLoad) {
                this.getDropDownList(columnDetails.ControlElement)
              }
            }
          }
          else {
            this.checkForOnPageLoad(columnDetails.GroupElement.RowDetailsList);
          }
        }
      }
    }

  }

  checkForReadOnly(rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {
          if (columnDetails.ElementType == ElementType.ControlElement && columnDetails.ControlElement.ReadOnly) {
            this.genericForm.controls[columnDetails.ControlElement.FieldName].disable();
          } else  if (this.router.url.includes('Team') && columnDetails.ControlElement.FieldName == 'PayGroupId') {
            // call API to get dropdown list data
            let parentElementList: any[] = null;
            const controlElement = columnDetails.ControlElement;
            if (controlElement.ParentFields !== null && controlElement.ParentFields !== []) {
              parentElementList = this.getParentControlElementList(controlElement);
            }
            // and set default value as "ciel flexibale pay structure by CTC and disable the dropdown"
            this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {
              if (dropDownList.Status && dropDownList.dynamicObject && dropDownList.dynamicObject !== '') {
                controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
                if (controlElement.DropDownList.length) {
                  const businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
                  const flexPayStructureVal =  controlElement.DropDownList.find( list => list['Name'] == 'CIEL Flexible Pay Structure using CTC' );
                  if (flexPayStructureVal && businessType == 3) {
                    this.genericForm.controls[columnDetails.ControlElement.FieldName].setValue(flexPayStructureVal[controlElement.ValueField]);
                    this.genericForm.controls[columnDetails.ControlElement.FieldName].disable();
                  }
                  console.log("PayGroup-drpdwn value:::" , flexPayStructureVal);
                } else {
                  console.log("no data for PayGroup dropdown ", controlElement);
                  controlElement.DropDownList = [];
                }
              } else {
                console.log("could not fetch for PayGroup dropdown", controlElement);
                controlElement.DropDownList = [];
              }
            }, error => {
              console.log("could not fetch dropdown list for PayGroup :::", error);
              controlElement.DropDownList = [];
            })
           
          } else {
            this.checkForReadOnly(columnDetails.GroupElement.RowDetailsList);
          }
        }
      }
    }
  }


  onOpeningDropDown(controlElement: ControlElement) {
    console.log(' *** dropdown ControlElement***',  controlElement);
    this.getDropDownList(controlElement);
    // if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
    //   this.getDropDownList(controlElement);
    // }
    // else if(controlElement.DropDownList.length > 0){
    //   if(controlElement.ParentFields !== null && controlElement.ParentFields.length > 0){
    //     this.getDropDownList(controlElement);
    //   }

    // }
  }

  getDropDownList(controlElement: ControlElement) {
    controlElement.DropDownList = null;
    let parentElementList: any[] = null;
    if (controlElement.ParentFields !== null && controlElement.ParentFields !== []) {
      parentElementList = this.getParentControlElementList(controlElement);
    }
    this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {

      if (dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '')
        controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);

      if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
        console.log("could not fetch list of " + controlElement.Label);
        controlElement.DropDownList = [];
      }
    }, error => {
      console.log(error);
      controlElement.DropDownList = [];
    })
  }

  getParentControlElementList(controlElement: ControlElement) {
    let parentElementList: {
      FieldName: string,
      Value: null
    }[] = [];
    for (let parent of controlElement.ParentFields) {
      parentElementList.push({
        FieldName: parent,
        Value: this.genericForm.controls[parent].value
      })
    }
    return parentElementList;
  }

  angularGridReady(dataSourceTreeNode: DataSourceTreeNode, angularGrid: AngularGridInstance) {
    dataSourceTreeNode.AngularGrid = angularGrid;
    dataSourceTreeNode.GridObj = angularGrid.slickGrid; // grid object
    dataSourceTreeNode.DataviewObj = angularGrid.dataView;
  }

  onAddButtonClicked(dataSourceTreeNode: DataSourceTreeNode) {
    const modalRef = this.modalService.open(GenericFormUiModalComponent);
    modalRef.componentInstance.id = 0;
    modalRef.componentInstance.isEdit = false;
    modalRef.componentInstance.dataSourceTree = dataSourceTreeNode;
    modalRef.componentInstance.entityRelations = this.formLayout.EntityRelations;
    modalRef.result.then((result) => {
      console.log("DatasourceTree ::", this.formLayout.DataSourceTree);
    })
  }

  onCellClicked(dataSourceTreeNode: DataSourceTreeNode, e, args) {
    // const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    // if (metadata.columnDef.id === 'edit') {
    //   this.CitiesObject = metadata.dataContext;
    //   this.addCity();
    // }
    // else if (metadata.columnDef.id === 'delete') {
    //    this.sweetalertConfirm(metadata.dataContext);
    // }

    const column = dataSourceTreeNode.AngularGrid.gridService.getColumnFromEventArguments(args);
    console.log(column);
    var flag = false;
    for (var i = 0; i < dataSourceTreeNode.GridConfiguration.ColumnDefinitionList.length; ++i) {
      //console.log(dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i]);
      if (column.columnDef.id === dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].Id) {
        console.log(dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i]);
        flag = dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].Clickable;
        if (flag) {
          console.log("clicked", column)
          if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].FunctionName !== null
            && dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].FunctionName !== '') {
            this.executeFunction(dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i], column.dataContext)
          }
          else if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].RouteLink !== null
            && dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].RouteLink !== '') {

            if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
              this.rowDataService.dataInterface.RowData = column.dataContext;
              if (dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null
                && dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
                dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(
                  searchElementValue => {
                    searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
                  }
                )
                this.rowDataService.dataInterface.SearchElementValuesList = dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
              }
            }
            else {
              this.rowDataService.dataInterface.RowData = null;
              this.rowDataService.dataInterface.SearchElementValuesList = [];
            }

            console.log('tt', this.rowDataService);
            sessionStorage.removeItem("RowDataInterface");
            sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));

            this.router.navigate([dataSourceTreeNode.GridConfiguration.ColumnDefinitionList[i].RouteLink])

          }
          else {
            const modalRef = this.modalService.open(GenericFormUiModalComponent);
            modalRef.componentInstance.id = column.dataContext.Id;
            modalRef.componentInstance.isEdit = true;
            modalRef.componentInstance.dataSourceTree = dataSourceTreeNode;
            modalRef.componentInstance.entityRelations = this.formLayout.EntityRelations;
            modalRef.componentInstance.rowData = column.dataContext;
            modalRef.result.then((result) => {
              console.log(this.formLayout.DataSourceTree);
            })
          }

        }
        break;
      }
    }
  }


  executeFunction(columnDefinition: ColumnDefinition, rowData: any) {
    switch (columnDefinition.FunctionName) {

      // case 'delete': {
      //   this.delete(rowData);
      //   break;
      // }

      // case 'executeQuery': {
      //   if(columnDefinition.SendDataToFunction)
      //     this.executeQuery(rowData , columnDefinition.FunctionData);
      //   break;
      // }

      // case 'approve_pvr': {
      //   this.approve_pvr(rowData);
      //   break;
      // }

      // case 'reject_pvr': {
      //   this.reject_pvr(rowData);
      //   break;
      // }
    }
  }

  async onSubmit() {

    console.log("Master Generic Form ::", this.genericForm);

    if (this.formLayout.SaveConfiguration.UseGeneralApi && this.formLayout.SaveConfiguration.UseGeneralSP) {
      this.submitted = true;
      if (this.genericForm.invalid) {
        alert('form invalid')
        return;
      }


      if (!this.editing) {
        this.formAuditModel = new FormAuditModel();
        let oldDetails = this.defaultFormObject;
        delete oldDetails['Id'];
        this.formAuditModel.OldDetails = JSON.stringify(this.defaultFormObject),
          this.formAuditModel.Id = 0;
        //this.formAuditModel.DataSourceList = this.formLayout.DataSourceList;
        this.formAuditModel.EntityRelations = this.formLayout.EntityRelations;
        //this.formAuditModel.OldRowDetailsList = this.oldRowDetailsList;
      }

      if (this.formLayout.DataSourceTree.OldRowDetailsList == undefined || this.formLayout.DataSourceTree.OldRowDetailsList == null)
        this.formLayout.DataSourceTree.OldRowDetailsList = [];

      if (this.formLayout.DataSourceTree.NewRowDetailsList == undefined || this.formLayout.DataSourceTree.NewRowDetailsList == null)
        this.formLayout.DataSourceTree.NewRowDetailsList = []

      this.formLayout.DataSourceTree.OldRowDetailsList = [];
      this.formLayout.DataSourceTree.NewRowDetailsList = [];

      this.formLayout.DataSourceTree.OldRowDetailsList.push({
        Id: this.id,
        RowDetailsList: this.oldRowDetailsList
      })
      this.formLayout.DataSourceTree.NewRowDetailsList.push({
        Id: this.id,
        RowDetailsList: JSON.parse(JSON.stringify(this.formLayout.DataSourceTree.RowDetailsList))
      })

      console.log(this.formLayout.DataSourceTree);

      let newDetails = this.genericForm.getRawValue();
      delete newDetails['Id']
      let dataSourceNode = new DataSourceTreeNode();
      dataSourceNode = this.clearData(dataSourceNode, this.formLayout.DataSourceTree);



      // delete dataSourceNode.Children[0]['AngularGrid'];
      // delete dataSourceNode.Children[0]['GridObj'];
      // delete dataSourceNode.Children[0]['DataviewObj'];
      // delete dataSourceNode.Children[0]['Columns'];    
      // delete dataSourceNode.Children[0]['GridOptions'];    
      // delete dataSourceNode.Children[0]['Dataset'];    

      console.log(dataSourceNode);
      this.formAuditModel.DataSourceTree = dataSourceNode;

      //this.formAuditModel.NewDetails = JSON.stringify(newDetails);
      //this.formAuditModel.RowDetailsList = this.formLayout.RowDetailsList;



      console.log(this.formAuditModel);
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.spinner = true;
          this.formLayoutService.upsertFormDetails(this.formAuditModel).subscribe(dataset => {
            this.spinner = false;
            console.log(dataset);
            if (dataset.Status) {
              this.alertService.showSuccess("Save Sucessfull");
              this.router.navigate([this.formLayout.SaveConfiguration.AfterSaveRouteLink]);

            }
            else {
              this.alertService.showWarning("Error Occured");
            }
          }, error => {
            this.spinner = false;
            this.alertService.showWarning("Unknown Error Occured");
            console.log(error);
          }
          )

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          this.spinner = false;
        }
      })
    }
    else if (this.formLayout.SaveConfiguration.UseGeneralApi && !this.formLayout.SaveConfiguration.UseGeneralSP) {
      console.log("Final FormLayout ::", this.formLayout);

      let newFormData = _.cloneDeep(this.formData);
      let obj = {};

      this.getEntityMappedData(this.formLayout.DataSourceTree, obj);

      if (this.id > 0) {
        Object.assign(newFormData, obj);
      }
      else {
        newFormData = _.cloneDeep(obj);
        newFormData["Id"] = 0
      }

      console.log("Final Submit Obj ::", newFormData);

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.spinner = true;
          this.formLayoutService.uploadFormDataToCustomSP(this.formLayout.Code, newFormData).subscribe(dataset => {
            this.spinner = false;
            console.log(dataset);
            if (dataset.Status) {
              this.alertService.showSuccess(dataset.Message);
              this.router.navigate([this.formLayout.SaveConfiguration.AfterSaveRouteLink]);
            }
            else {
              this.alertService.showWarning(dataset.Message);
            }
          }, error => {
            this.spinner = false;
            this.alertService.showWarning("Unknown Error Occured");
            console.log(error);
          }
          )

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          this.spinner = false;
        }
      })

    }
    else {
      console.log("Final FormLayout ::", this.formLayout);
      let newFormData = _.cloneDeep(this.formData);

      let obj = {};

      this.getEntityMappedData(this.formLayout.DataSourceTree, obj);

      if (this.id > 0) {
        Object.assign(newFormData, obj)
      }
      else {
        newFormData = _.cloneDeep(obj);
        newFormData["Id"] = 0;
      }

      console.log("Final Submit Obj ::", newFormData);

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.spinner = true;
          this.formLayoutService.uploadDataToCustomApi(this.formLayout.SaveConfiguration.ApiName, newFormData,
            this.formLayout.SaveConfiguration.ApiRequestType).subscribe(dataset => {
              this.spinner = false;
              console.log(dataset);
              if (dataset.Status) {
                this.alertService.showSuccess("Save Sucessfull");
                this.router.navigate([this.formLayout.SaveConfiguration.AfterSaveRouteLink]);
                // this.router.navigate(['app/ui/TaxCode']);
              }
              else {
                this.alertService.showWarning("Error Occured");
              }
            }, error => {
              this.spinner = false;
              this.alertService.showWarning("Unknown Error Occured");
              console.log(error);
            }
            )

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          this.spinner = false;
        }
      })

    }

  }

  getEntityMappedData(datasourceTree: DataSourceTreeNode, objRef: any) {
    if (datasourceTree.RelationWithParent == RelationWithParent.None) {

      this.getJsonFromRowList(objRef, datasourceTree.RowDetailsList);
      Object.assign(objRef, objRef[datasourceTree.DataSource.Name]);
      console.log("Obj")
      delete objRef[datasourceTree.DataSource.Name];
    }
    else {
      if (datasourceTree.Dataset != undefined && datasourceTree.Dataset != null && datasourceTree.Dataset.length > 0) {
        objRef[datasourceTree.DataSource.Name] = datasourceTree.Dataset;
      }
      else {
        objRef[datasourceTree.DataSource.Name] = [];
      }
    }

    for (let childDatasourceTree of datasourceTree.Children) {
      this.getEntityMappedData(childDatasourceTree, objRef);
    }
  }

  getJsonFromRowList(obj: {}, rowDetailsList: RowDetails[]) {
    for (let rowDetails of rowDetailsList) {
      if (rowDetails.ColumnDetailsList !== null && rowDetails.ColumnDetailsList.length > 0) {
        for (let columnDetails of rowDetails.ColumnDetailsList) {

          if (columnDetails.ElementType == ElementType.ControlElement) {
            let fieldName: string = columnDetails.ControlElement.FieldName;
            let value = columnDetails.ControlElement.Value;

            for (let entity of columnDetails.ControlElement.EntityList) {
              if (!obj.hasOwnProperty(entity)) obj[entity] = {};
              obj[entity][fieldName] = value;
            }

          }
          else {
            this.insertControlElementsIntoObj(obj, columnDetails.GroupElement.RowDetailsList);
          }

        }
      }
    }
  }



  clearData(toNode: DataSourceTreeNode, fromNode: DataSourceTreeNode) {
    toNode = {
      DataSource: fromNode.DataSource,
      RelationWithParent: fromNode.RelationWithParent,
      RowDetailsList: fromNode.RowDetailsList,
      Children: [],
      OldRowDetailsList: fromNode.OldRowDetailsList,
      NewRowDetailsList: fromNode.NewRowDetailsList,
    }
    for (let node of fromNode.Children) {
      let newNode = new DataSourceTreeNode();
      toNode.Children.push(this.clearData(newNode, node));
    }
    return toNode;
  }

  onExit() {
    this.router.navigate(['app/ui/TaxCode']);
  }


  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        if (this.formLayout.SaveConfiguration.AfterSaveRouteLink == null) {
          if (this.code === 'Team') {
            this.router.navigate(['/app/listing/ui/Teams']);
          } else {
            this.router.navigate(['/app/listing/ui/ManagerMapping']);
          }

        } else {
          this.router.navigate([this.formLayout.SaveConfiguration.AfterSaveRouteLink]);

        }

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })
  }

  editRow() {

  }

  deleteRow() {

  }
}
