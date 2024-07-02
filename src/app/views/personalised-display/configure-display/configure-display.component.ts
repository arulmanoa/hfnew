import { Component, OnInit } from '@angular/core';
import { PageLayout, GridConfiguration, SearchConfiguration, DataSource, SearchElement, ColumnDefinition, PageProperties, DataSecurityConfiguration, UserBasedDataSecurityConfiguration, RoleBasedDataSecurityConfiguration } from '../models';
import { DataSourceType, InputControlType, DefaultLayoutType, ColumnType, RowSelectionType } from '../enums';
import { Data, ActivatedRoute } from '@angular/router';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { KeyValue } from '@angular/common/src/pipes';
import { StringNullableChain } from 'lodash';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { stringFilterCondition } from 'angular-slickgrid/app/modules/angular-slickgrid/filter-conditions/stringFilterCondition';
import { AlertService } from 'src/app/_services/service/alert.service';
import _ from 'lodash';

@Component({
  selector: 'app-configure-display',
  templateUrl: './configure-display.component.html',
  styleUrls: ['./configure-display.component.scss']
})
export class ConfigureDisplayComponent implements OnInit {
  code: string = null;
  editing: boolean = false;
  column: string;
  type: string;
  key: string;
  keyType: string;
  inputFieldName: string;
  outputFieldName: string;
  readOnly: boolean;
  pageLayout: PageLayout = null;
  displayOrderOfColumns: number[] = [];
  dropDownValue: string;
  columnObjectLastKey: number = null;
  numberOfColumns: number[] = [0];
  columnNames: string[] = null;
  searchElementColumns: string[] = [];
  columnNamesForSearchElements: { name: string, value: boolean }[] = [];
  columnNamesForColumnDefinition: { name: string, value: boolean }[] = [];
  paramNames: string[] = null;
  DataSourceType: DataSourceType;
  spinner: boolean = false;
  submitSpinner: boolean = false;
  dataSourceTypeNames = [
    {
      label: 'View',
      value: DataSourceType.View
    },
    {
      label: 'Stored Procedure',
      value: DataSourceType.SP
    },
    {
      label: 'Fixed Values',
      value: DataSourceType.FixedValues
    },
    {
      label: 'External API',
      value: DataSourceType.ExternalAPI
    }
  ];
  inputControlTypeNames = [
    {
      label: 'Text Box',
      value: InputControlType.TextBox
    },
    {
      label: 'Drop Down',
      value: InputControlType.DropDown
    },
    {
      label: 'Multi Select Drop Down',
      value: InputControlType.MultiSelectDropDown
    },
    {
      label: 'Autofill Text Box',
      value: InputControlType.AutoFillTextBox
    },
    {
      label: 'Check Box',
      value: InputControlType.CheckBox
    },
    {
      label: 'Comma Separated strings',
      value: InputControlType.CommaSeparatedStrings
    },
    {
      label: 'Comma Separated numbers',
      value: InputControlType.CommaSeparatedNumbers
    },
    {
      label: 'Date Picker',
      value: InputControlType.DatePicker
    }
  ]
  acceptedAggregatorTypes = [
    {
      label: 'Sum',
      value: 'sum'
    },
    {
      label: 'Mininum',
      value: 'min'
    },
    {
      label: 'Maximum',
      value: 'max'
    },
    {
      label: 'Average',
      value: 'average'
    }
  ]
  defaultLayoutTypeNames = [
    {
      label: "Card",
      value: DefaultLayoutType.Card
    },
    {
      label: "Grid",
      value: DefaultLayoutType.Grid
    },
    {
      label: "Excel",
      value: DefaultLayoutType.Excel
    }
  ];
  rowSelectionTypeNames = [
    {
      label: "Single",
      value: RowSelectionType.Single
    },
    {
      label: "Multiple",
      value: RowSelectionType.Multiple
    }
  ]

  editorTypeNames = [
    'text',
    'date',
    'integer',
    'float'
  ]

  filterTypeNmaes = [
    {
      label: "Textbox",
      value: "input"
    },
    {
      label: "Single Select Dropdown",
      value: "singleSelect"
    },
    {
      label: "Muliple Select Drop down",
      value: "multipleSelect"
    },

  ]

  searchElementList: SearchElement[] = null;
  columnDefinitionList: ColumnDefinition[];
  tempSearchElementObject = {};
  tempColumnDefinitionObject = {};
  keysinTempSearchElementObject = [];
  keysinTempColumnDefinitionObject = [];

  roleCode: string = '';
  RoleDataLevelSecurityRequired: boolean = false;
  OveridedUsers: UserBasedDataSecurityConfiguration[] = [];
  userId: number = 0;
  UserDataLevelSecurityRequired: boolean = false;
  displayOrder: number[] = [];

  originalOrder() {

  }

  constructor(
    private pageLayoutService: PagelayoutService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService) { }

  ngOnInit() {
  }


  onClickingEditButton() {
    if (this.code != '' && this.code != null) {
      //get page layout using code
      this.editing = true;
      this.spinner = true;
      this.columnObjectLastKey = null;

      this.loadingScreenService.startLoading();
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        this.loadingScreenService.stopLoading();
        console.log(data);
        this.spinner = false;
        if (data.Status == false) {
          this.alertService.showWarning(data.Message);
        }
        this.pageLayout = data.dynamicObject || null;
        if (this.pageLayout != null) {
          this.numberOfColumns = [0];
          this.displayOrderOfColumns = [];

          if (this.pageLayout.SearchConfiguration.SecurityKeys === undefined ||
            this.pageLayout.SearchConfiguration.SecurityKeys === null)
            this.pageLayout.SearchConfiguration.SecurityKeys = [["UserId"], ["RoleId"]];

          if (this.pageLayout.SearchConfiguration.IsDataLevelSecurityRequired === undefined ||
            this.pageLayout.SearchConfiguration.IsDataLevelSecurityRequired === null)
            this.pageLayout.SearchConfiguration.IsDataLevelSecurityRequired = false;

          for (let searchElement of this.pageLayout.SearchConfiguration.SearchElementList) {
            if (searchElement.DataSecurityConfiguration === undefined || searchElement.DataSecurityConfiguration === null) {
              searchElement.DataSecurityConfiguration = new DataSecurityConfiguration();
            }

            if (searchElement.DisplayOrder === undefined || searchElement.DisplayOrder === null) {
              searchElement.DisplayOrder = 0;
            }
          }

          if (this.pageLayout.GridConfiguration.DataSource.Type == DataSourceType.View) {
            this.onClickingDataSourceConfirmButton();
            this.searchElementList = this.pageLayout.SearchConfiguration.SearchElementList;
          }

          if (this.pageLayout.GridConfiguration.DataSource.Type == DataSourceType.SP) {
            for (var i = 0; i < this.pageLayout.SearchConfiguration.SearchElementList.length; ++i) {
              // this.pageLayout.SearchConfiguration.SearchElementList[i].IsIncludedInDefaultSearch = true;
              this.pageLayout.SearchConfiguration.SearchElementList[i].Value = null;
              this.tempSearchElementObject[i] = this.pageLayout.SearchConfiguration.SearchElementList[i];
            }
            console.log(this.pageLayout.SearchConfiguration.SearchElementList);
            this.searchElementList = this.pageLayout.SearchConfiguration.SearchElementList;
            this.keysinTempSearchElementObject = Object.keys(this.tempSearchElementObject);
            this.displayOrder = [];
            for (let i = 1; i <= this.keysinTempSearchElementObject.length; ++i) {
              this.displayOrder.push(i);
            }
            console.log("Display order ::", this.displayOrder, this.keysinTempSearchElementObject);
            this.getColumnNamesForSP();

          }
        }

      }, error => {
        this.loadingScreenService.stopLoading();
        this.spinner = false;
        this.alertService.showWarning("Sorry! Error Occured");
        console.log(error);
      }
      );


    }
  }

  onClickingAddNewButton() {
    this.editing = false;
    this.pageLayout = new PageLayout();
    this.pageLayout.PageProperties = new PageProperties();
    this.pageLayout.GridConfiguration = new GridConfiguration();
    this.pageLayout.GridConfiguration.DataSource = new DataSource();
    this.pageLayout.SearchConfiguration = new SearchConfiguration();
    this.pageLayout.SearchConfiguration.SecurityKeys = [["UserId"], ["RoleId"]];
    this.pageLayout.SearchConfiguration.SearchElementList = [];

  }

  onClickingDataSourceConfirmButton() {

    if (this.pageLayout.GridConfiguration.DataSource.Name != null && this.pageLayout.GridConfiguration.DataSource.Name != '') {
      if (this.pageLayout.GridConfiguration.DataSource.Type == DataSourceType.View) {
        this.loadingScreenService.startLoading();
        this.pageLayoutService.getColumnOrParamName(this.pageLayout.GridConfiguration.DataSource).subscribe(dataset => {
          this.loadingScreenService.stopLoading();
          if (dataset.Status == true && dataset.dynamicObject) {
            this.columnNames = [];
            this.columnNamesForColumnDefinition = [];
            this.columnNamesForSearchElements = [];
            this.columnNames = dataset.dynamicObject;
            this.columnObjectLastKey = this.columnNames.length;
            for (var i = 0; i < this.columnNames.length; ++i) {
              this.columnNamesForSearchElements.push({
                name: this.columnNames[i],
                value: false
              });
              this.columnNamesForColumnDefinition.push({
                name: this.columnNames[i],
                value: false
              })
            }
            if (this.editing) {

              for (let searchElement of this.pageLayout.SearchConfiguration.SearchElementList) {
                let i = this.columnNames.indexOf(searchElement.FieldName);
                if (i > -1) {
                  this.onClickingSearchElementCheckBox(i, null, searchElement);
                }
                else console.log("Column : " + searchElement.FieldName + " does not exist in database! Please check Search Elements")
              }

              for (let columnDefinition of this.pageLayout.GridConfiguration.ColumnDefinitionList) {
                if (columnDefinition.SearchElementValuesList === null) columnDefinition.SearchElementValuesList = [];
                if (columnDefinition.Type == ColumnType.Basic) {
                  let i = this.columnNames.indexOf(columnDefinition.FieldName);
                  if (i > -1) {
                    this.onClickingColumnSelectCheckBox(i, null, columnDefinition);
                    this.onDisplayOrderChange(columnDefinition.DisplayOrder, i);
                  }
                  else
                    console.log("Column : " + columnDefinition.FieldName + " does not exist in database! Please check Column Definition List")
                }
                else {
                  this.tempColumnDefinitionObject[this.columnObjectLastKey] = columnDefinition;
                  this.onDisplayOrderChange(columnDefinition.DisplayOrder, this.columnObjectLastKey);
                  this.columnObjectLastKey += 1;
                }
              }
            }
          }
          else {
            console.log(dataset);
          }
        }, error => {
          this.loadingScreenService.stopLoading();
          console.log(error);
        })
      }
      else if (this.pageLayout.GridConfiguration.DataSource.Type == DataSourceType.SP) {
        this.loadingScreenService.startLoading();
        this.pageLayoutService.getColumnOrParamName(this.pageLayout.GridConfiguration.DataSource).subscribe(dataset => {
          this.loadingScreenService.stopLoading();
          console.log("Param result ::", dataset);
          if (dataset.Status == true && dataset.dynamicObject) {
            this.paramNames = dataset.dynamicObject;
            if (this.paramNames != undefined && this.paramNames != null && this.paramNames.length > 0) {
              this.tempSearchElementObject = [];
              this.keysinTempSearchElementObject = [];
              for (var i = 0; i < this.paramNames.length; ++i) {
                this.tempSearchElementObject[i] = new SearchElement();
                this.tempSearchElementObject[i].DataSource = new DataSource();
                this.tempSearchElementObject[i].DataSecurityConfiguration = new DataSecurityConfiguration();
                this.tempSearchElementObject[i].FieldName = this.paramNames[i];
                this.tempSearchElementObject[i].InputControlType = InputControlType.TextBox;
              }
              this.keysinTempSearchElementObject = Object.keys(this.tempSearchElementObject);
              console.log(this.tempSearchElementObject);
              this.displayOrder = [];
              for (let i = 1; i <= this.keysinTempSearchElementObject.length; ++i) {
                this.displayOrder.push(i);
              }

            }
            else {
              this.tempSearchElementObject = [];
              this.keysinTempSearchElementObject = [];
              this.paramNames = [];
            }
          }
        }, error => {
          this.loadingScreenService.stopLoading();
          console.log(error);
        }
        )
      }
      else if (this.pageLayout.GridConfiguration.DataSource.Type == DataSourceType.ExternalAPI) {
        console.log(this.pageLayout);
        if (this.pageLayout.GridConfiguration.DataSource.Name && this.pageLayout.GridConfiguration.DataSource.Name != '') {
          this.paramNames = this.getParams(this.pageLayout.GridConfiguration.DataSource.Name) as any;
          this.tempSearchElementObject = [];
          this.keysinTempSearchElementObject = [];
          for (var i = 0; i < this.paramNames.length; ++i) {
            this.tempSearchElementObject[i] = new SearchElement();
            this.tempSearchElementObject[i].DataSource = new DataSource();
            this.tempSearchElementObject[i].DataSecurityConfiguration = new DataSecurityConfiguration();
            this.tempSearchElementObject[i].FieldName = this.paramNames[i];
            this.tempSearchElementObject[i].InputControlType = InputControlType.TextBox;
          }
          this.keysinTempSearchElementObject = Object.keys(this.tempSearchElementObject);
          console.log(this.keysinTempSearchElementObject);
          this.displayOrder = [];
          for (let i = 1; i <= this.keysinTempSearchElementObject.length; ++i) {
            this.displayOrder.push(i);
          }
        } else {
          this.alertService.showWarning('Please enter Datasource name for External API');
        }
      }
    }
  }

  onClickingSearchElementConfirmButton() {
    this.searchElementList = [];

    if (this.keysinTempSearchElementObject != undefined && this.keysinTempSearchElementObject != null) {
      for (var i = 0; i < this.keysinTempSearchElementObject.length; ++i) {
        this.searchElementList.push(this.tempSearchElementObject[this.keysinTempSearchElementObject[i]]);
      }

      this.searchElementList = _.orderBy(this.searchElementList, ["DisplayOrder"], "asc");
    }


    if (this, this.pageLayout.GridConfiguration.DataSource.Type == DataSourceType.SP) {
      this.getColumnNamesForSP();
    }

    if (this.searchElementList.length === 0)
      this.searchElementList = null;
    else
      this.pageLayout.SearchConfiguration.SearchElementList = this.searchElementList;
    console.log(this.pageLayout.SearchConfiguration.SearchElementList);
  }

  getColumnNamesForSP() {
    this.loadingScreenService.startLoading();
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.searchElementList).subscribe(dataset => {
      this.loadingScreenService.stopLoading();
      if (dataset.Status == true && dataset.dynamicObject) {
        this.columnNames = Object.keys(JSON.parse(dataset.dynamicObject)[0]);
        console.log(this.columnNames);
        this.columnNamesForColumnDefinition = [];
        this.columnNamesForSearchElements = [];
        this.columnObjectLastKey = this.columnNames.length;
        for (let Column of this.columnNames) {
          this.columnNamesForSearchElements.push({
            name: Column,
            value: false
          })
          this.columnNamesForColumnDefinition.push({
            name: Column,
            value: false
          })
        }
        if (this.editing) {

          this.tempColumnDefinitionObject = {};

          for (let columnDefinition of this.pageLayout.GridConfiguration.ColumnDefinitionList) {
            if (columnDefinition.SearchElementValuesList === null) columnDefinition.SearchElementValuesList = [];
            if (columnDefinition.Type == ColumnType.Basic) {
              let i = this.columnNames.indexOf(columnDefinition.FieldName);
              if (i > -1) {
                this.onClickingColumnSelectCheckBox(i, null, columnDefinition);
                this.onDisplayOrderChange(columnDefinition.DisplayOrder, i);
              }
              else
                console.log("Column : " + columnDefinition.FieldName + " does not exist in database! Please check Column Definition List")
            }
            else {
              this.tempColumnDefinitionObject[this.columnObjectLastKey] = columnDefinition;
              this.onDisplayOrderChange(columnDefinition.DisplayOrder, this.columnObjectLastKey);
              this.columnObjectLastKey += 1;
            }

          }
        }
      }
      else {
        console.log("Could Not Fetch Column Names");
        console.log(dataset);
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log(error);
    })
  }

  onClickingColumnDefinitionConfirmButton() {
    this.columnDefinitionList = [];

    for (var i = 1; i < this.displayOrderOfColumns.length; ++i) {
      if (this.tempColumnDefinitionObject[this.displayOrderOfColumns[i]] !== undefined &&
        this.tempColumnDefinitionObject[this.displayOrderOfColumns[i]] !== null) {
        this.columnDefinitionList.push(this.tempColumnDefinitionObject[this.displayOrderOfColumns[i]]);
      }
    }

    if (this.columnDefinitionList.length == 0) this.columnDefinitionList = null;
    else this.pageLayout.GridConfiguration.ColumnDefinitionList = this.columnDefinitionList;
    console.log(this.pageLayout);
    console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList);
  }

  onClickingSearchElementCheckBox(i: number, event: any = null, searchElement: SearchElement = null) {
    //console.log(event,i)
    console.log(searchElement, i, event);
    this.columnNamesForSearchElements[i].value = !this.columnNamesForSearchElements[i].value;

    if (this.columnNamesForSearchElements[i].value) {
      if (event) {
        this.tempSearchElementObject[i] = new SearchElement();
        this.tempSearchElementObject[i].DataSource = new DataSource();
        this.tempSearchElementObject[i].DataSecurityConfiguration = new DataSecurityConfiguration();
        this.tempSearchElementObject[i].FieldName = this.columnNames[i];
      }
      else if (searchElement != null) {
        this.tempSearchElementObject[i] = searchElement;
      }
    }
    else {
      delete this.tempSearchElementObject[i];
    }
    //console.log(this.tempSearchElementObject);
    this.keysinTempSearchElementObject = Object.keys(this.tempSearchElementObject);
    this.displayOrder = [];
    for (let i = 1; i <= this.keysinTempSearchElementObject.length; ++i) {
      this.displayOrder.push(i);
    }
  }

  onClickingColumnSelectCheckBox(i: number, event: any, columnDefinition: ColumnDefinition = null) {
    //console.log(event,i)
    this.columnNamesForColumnDefinition[i].value = !this.columnNamesForColumnDefinition[i].value
    if (this.columnNamesForColumnDefinition[i].value) {
      if (event) {
        this.tempColumnDefinitionObject[i] = new ColumnDefinition();
        this.tempColumnDefinitionObject[i].GroupAggregatorColumnAndType = [];
        this.tempColumnDefinitionObject[i].SearchElementValuesList = [];
        this.tempColumnDefinitionObject[i].Id = this.columnNames[i];
        this.tempColumnDefinitionObject[i].FieldName = this.columnNames[i];
        this.tempColumnDefinitionObject[i].Type = ColumnType.Basic;
        console.log(this.tempColumnDefinitionObject);
      }
      else if (columnDefinition) {
        this.tempColumnDefinitionObject[i] = columnDefinition;
      }
      this.numberOfColumns.push(this.numberOfColumns[this.numberOfColumns.length - 1] + 1);
    }
    else {
      delete this.tempColumnDefinitionObject[i];
      this.numberOfColumns.splice(-1, 1);
    }
    //console.log(this.tempSearchElementObject);
    this.keysinTempColumnDefinitionObject = Object.keys(this.tempColumnDefinitionObject)
  }

  onClickingAddNewColumnButton() {
    if (this.columnObjectLastKey) {
      this.tempColumnDefinitionObject[this.columnObjectLastKey] = new ColumnDefinition();
      this.tempColumnDefinitionObject[this.columnObjectLastKey].GroupAggregatorColumnAndType = [];
      this.tempColumnDefinitionObject[this.columnObjectLastKey].Type = ColumnType.Custom;
      this.tempColumnDefinitionObject[this.columnObjectLastKey].Id = "CustomColumn" + (Object.keys(this.tempColumnDefinitionObject).length).toString();
      this.columnObjectLastKey += 1;
      this.numberOfColumns.push(this.numberOfColumns[this.numberOfColumns.length - 1] + 1);
    }
  }

  onClickingGroupAggregatorAddButton(key: number) {
    if (this.tempColumnDefinitionObject[key].GroupAggregatorColumnAndType == null)
      this.tempColumnDefinitionObject[key].GroupAggregatorColumnAndType = [];

    this.tempColumnDefinitionObject[key].GroupAggregatorColumnAndType.push({
      Column: this.column,
      Type: this.type,
    })
  }

  onClickingRemoveGroupAggregatorButton(i: number, columnDefinition: ColumnDefinition) {
    columnDefinition.GroupAggregatorColumnAndType.splice(i, 1);
  }

  onClickingDropDownValueAddButton(searchElement: SearchElement) {
    if (searchElement.DropDownList == null) {
      searchElement.DropDownList = [];
    }
    searchElement.DropDownList.push(this.dropDownValue);
  }

  onClickingRemoveDropDownValue(i: number, searchElement: SearchElement) {
    searchElement.DropDownList.splice(i, 1);
  }

  onClickingRoutingValueAddButton(columnDefinition: ColumnDefinition) {
    if (columnDefinition.SearchElementValuesList == null) columnDefinition.SearchElementValuesList = [];
    columnDefinition.SearchElementValuesList.push({
      InputFieldName: this.inputFieldName,
      OutputFieldName: this.outputFieldName,
      ReadOnly: this.readOnly
    });
    //console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList);
  }

  onClickingRemoveSearchElementValue(i: number, columnDefinition: ColumnDefinition) {
    columnDefinition.SearchElementValuesList.splice(i, 1);
  }

  onClickingAddKeyButton(columnDefinition: ColumnDefinition) {
    if (columnDefinition.FunctionDataType == null)
      columnDefinition.FunctionDataType = {};

    if (this.keyType === 'string')
      columnDefinition.FunctionDataType[this.key] = ''

    else if (this.keyType === 'number')
      columnDefinition.FunctionDataType[this.key] = 0

    else
      columnDefinition.FunctionDataType[this.key] = false;
  }

  onClickingRemoveFunctionDataKey(key: string, columnDefinition: ColumnDefinition) {
    delete columnDefinition.FunctionDataType[key];
  }

  onclickingAddFunctionDataButton(columnDefinition: ColumnDefinition) {
    if (columnDefinition.FunctionData == null)
      columnDefinition.FunctionData = [];
    let obj = Object.assign({}, columnDefinition.FunctionDataType);
    columnDefinition.FunctionData.push(obj);
  }

  onClickingRemoveFunctionData(i: number, columnDefinition: ColumnDefinition) {
    columnDefinition.FunctionData.splice(i, 1);
  }

  onClickingSubmitButton() {
    console.log(this.pageLayout);
    if (!this.pageLayout.GridConfiguration.RowSelectionCheckBoxRequired)
      this.pageLayout.GridConfiguration.RowSelectionType = RowSelectionType.None;

    this.submitSpinner = true;
    this.loadingScreenService.startLoading();
    this.pageLayoutService.postPageLayout(this.pageLayout).subscribe(data => {
      this.loadingScreenService.stopLoading();
      this.submitSpinner = false;
      if (data.Status) {
        this.alertService.showSuccess(data.Message);
      }
      else {
        this.alertService.showWarning(data.Message);
        console.log(data);
      }


    }, error => {
      this.loadingScreenService.stopLoading();
      this.submitSpinner = false;
      this.alertService.showWarning("Sorry! Error Occured")
      console.log(error);

    });
  }

  onDisplayOrderChange(index, value) {
    this.displayOrderOfColumns[index] = value;
  }

  onOpeningForeignKeyDropDown(searchElement: SearchElement) {
    this.searchElementColumns = null;
    if (searchElement.DataSource.Type == DataSourceType.View) {
      this.loadingScreenService.startLoading();
      this.pageLayoutService.getColumnOrParamName(searchElement.DataSource).subscribe(dataset => {
        this.loadingScreenService.stopLoading();
        if (dataset.Status == true && dataset.dynamicObject) {
          this.searchElementColumns = [];
          this.searchElementColumns = dataset.dynamicObject;
        }
        else
          console.log(dataset);
      }, error => {
        this.loadingScreenService.stopLoading();
        console.log(error);
      })
    }
  }

  onClickingAddRoleSecurityConfigurationButton(searchElement: SearchElement) {
    if (searchElement.DataSecurityConfiguration === undefined || searchElement.DataSecurityConfiguration === null) {
      searchElement.DataSecurityConfiguration = new DataSecurityConfiguration();
    }

    if (searchElement.DataSecurityConfiguration.RoleBasedConfigurationList === undefined ||
      searchElement.DataSecurityConfiguration.RoleBasedConfigurationList === null) {
      searchElement.DataSecurityConfiguration.RoleBasedConfigurationList = [];
    }

    let roleBasedConfiguration: RoleBasedDataSecurityConfiguration = {
      RoleCode: this.roleCode,
      IsDataLeverSecurityRequired: this.RoleDataLevelSecurityRequired,
      OveridedUsers: this.OveridedUsers
    }

    searchElement.DataSecurityConfiguration.RoleBasedConfigurationList.push(roleBasedConfiguration);
    this.OveridedUsers = [];
  }

  onClickingRemoveRoleConfiguration(i, searchElement: SearchElement) {
    searchElement.DataSecurityConfiguration.RoleBasedConfigurationList.splice(i, 1);
  }

  onClickingOveridedUserConfigurationButton(searchElement: SearchElement) {

    if (this.OveridedUsers === undefined || this.OveridedUsers === null) {
      this.OveridedUsers = [];
    }

    let overidedUserConfiguration: UserBasedDataSecurityConfiguration = {
      IsDataLeverSecurityRequired: this.UserDataLevelSecurityRequired,
      UserId: this.userId
    }

    this.OveridedUsers.push(overidedUserConfiguration);

  }

  onClickingRemoveUserDataConfiguration(i: number) {
    this.OveridedUsers.splice(i, 1);
  }

  typeOf(item: any) {
    return typeof item;
  }

  trackByKey(index: number, item: any): string {
    return item.key;
  }

  getDisplayOrderArray() {

    for (let i; i < this.keysinTempSearchElementObject.length; ++i) {
      this.displayOrder.push(i);
    }

  }

  getParams(url: string) {
    const paramNames: string[] = [];
    const queryString = url.split('?')[1];

    if (queryString) {
      const keyValuePairs = queryString.split('&');
      for (const pair of keyValuePairs) {
        const [key] = pair.split('=');
        paramNames.push(key);
        // paramNames.push(`@${key}`);
      }
    }
    return paramNames;
  }
}
