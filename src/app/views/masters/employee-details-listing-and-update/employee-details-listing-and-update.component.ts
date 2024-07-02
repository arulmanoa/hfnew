import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AlertService, EmployeeService } from '@services/service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { AngularGridInstance, Column, EditorArguments, EditorValidator, Editors, FieldType, Filters, Formatters, GridOption, MultipleSelectOption, OnEventArgs } from 'angular-slickgrid';
import { SessionKeys } from '../../../_services/configs/app.config';
import { UtilityService } from '@services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import moment from 'moment';
declare var Slick: any;

enum StatusCode {
  NoChangeRequested = 0,
  PendingForApproval = 1,
  Rejected = 2,
  Approved = 3
}

const mobileNumberEditorValidator: EditorValidator = (value: string, args: any) => {
  // Check if the value is a valid mobile number
  const mobileRegex = /^[5-9]\d{9}$/;
  if (!mobileRegex.test(value)) {
    return { valid: false, msg: 'Please enter valid 10 digit number' };
  }
  return { valid: true, msg: '' };
}

export function customCellFormatter(row: number, cell: number, value: any, columnDef: any, dataContext: any, grid: any): string {
  return `<span style="color:blue">${value}</span>`;
}

@Component({
  selector: 'app-employee-details-listing-and-update',
  templateUrl: './employee-details-listing-and-update.component.html',
  styleUrls: ['./employee-details-listing-and-update.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeDetailsListingAndUpdateComponent implements OnInit {

  angularGrid: AngularGridInstance;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption;
  dataset: any[] = [];
  gridObj: any;
  private _commandQueue = [];

  originalData: any;
  clientId: any;
  clientContractId: any;
  Designation = [];
  Department = [];
  Division = [];
  City = [];
  Campus = [];
  updatedObject: any = [];

  table_data: any[] = [];

  spinner: boolean = false;
  showSlider: boolean = false;
  message = [];
  citiesList: any[] = [];
  selectedCity = '';
  showTable: boolean = false;
  roleCode: any;

  constructor(
    public sessionService: SessionStorage,
    private employeeservice: EmployeeService,
    public alertService: AlertService,
    private utilityservice: UtilityService,
    public loadingScreenService: LoadingScreenService
  ) { }

  ngOnInit() {
    this.spinner = true;

    this.message = environment.environment.MessageForDataCorrection ? environment.environment.MessageForDataCorrection : [];

    const loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    const businessType = loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientId = businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
    this.clientContractId = businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ContractId'));
    this.roleCode = loginSessionDetails.UIRoles[0].Role.Code;
    this.prepareGrid();
    this.loadData();
  }

  async loadData() {
    try {
      await this.getCityList();
      this.spinner = false;
    } catch (err) {
      console.log('ERR IN LOAD DATA', err);
    }
  }

  prepareGrid() {
    // grid option
    this.gridOptions = {
      enableAutoResize: true,
      asyncEditorLoading: false,
      autoEdit: true,
      autoCommitEdit: true,
      editable: true,
      enableCellNavigation: true,
      enableColumnPicker: true,
      enableExcelCopyBuffer: true,
      enableFiltering: true,
      enableSorting: true,
      datasetIdPropertyName: 'Id',
      enablePagination: false,
      enableAutoTooltip: true,
      editCommandHandler: (item, column, editCommand: any) => {
        console.log(this.originalData, this._commandQueue);
        const originalObject = this.originalData.EmployeeList.find(a => a.hasOwnProperty(column.field) && a.Id == item.Id);
        // Handle 'RequestedEffectiveDate' column
        if (column.id === 'RequestedEffectiveDate') {
          editCommand.RequestedEffectiveDate = editCommand.serializedValue;
          editCommand.isEffectiveDateUpdated = true;
          // Update RequestedEffectiveDate for all objects in this._commandQueue that match the EmployeeId
          this._commandQueue && this._commandQueue.length > 0 && this._commandQueue.forEach(cmd => {
            if (cmd.EmployeeId === item.Id) {
              cmd.isEffectiveDateUpdated = true;
              cmd.RequestedEffectiveDate = editCommand.serializedValue;
            }
          });
          // Update originalObject
          const originalObjectIndex = this.originalData.EmployeeList.findIndex(a => a.hasOwnProperty(column.field) && a.Id == item.Id);
          this.originalData.EmployeeList[originalObjectIndex].RequestedEffectiveDate = editCommand.serializedValue;
        } else {
          // Set default values only when isEffectiveDateUpdated is false
          if (!editCommand.isEffectiveDateUpdated) {
            if (this._commandQueue && this._commandQueue.length) {
              this._commandQueue.forEach(cmd => {
                if (cmd.EmployeeId === item.Id && cmd.FieldName == "RequestedEffectiveDate") {
                  editCommand.isEffectiveDateUpdated = true;
                  editCommand.RequestedEffectiveDate = cmd.RequestedEffectiveDate;
                } else {
                  editCommand.isEffectiveDateUpdated = (item.Status == StatusCode.Rejected || item.Status == StatusCode.Approved || editCommand.serializedValue == '') ? true : editCommand.isEffectiveDateUpdated ? editCommand.isEffectiveDateUpdated : false;
                  editCommand.RequestedEffectiveDate = (item.Status == StatusCode.Approved || item.Status == StatusCode.Rejected) && item.ApprovedEffectiveDate && item.ApprovedEffectiveDate != '1900-01-01T00:00:00' ? moment.utc(item.ApprovedEffectiveDate).format('YYYY-MM-DD') : editCommand.RequestedEffectiveDate ? editCommand.RequestedEffectiveDate : moment().format('YYYY-MM-DD');
                }
              });
            } else {
              editCommand.isEffectiveDateUpdated = ((item.ApprovedEffectiveDate && item.ApprovedEffectiveDate != '1900-01-01T00:00:00') || column.id == 'Mobile' || editCommand.serializedValue == '') ? true : false;
              editCommand.RequestedEffectiveDate = item.ApprovedEffectiveDate && item.ApprovedEffectiveDate != '1900-01-01T00:00:00' ? moment.utc(item.ApprovedEffectiveDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
            }
          }
          // Validate effective date
          // if (column.id != 'Mobile' && editCommand.serializedValue != '' && !editCommand.isEffectiveDateUpdated) {
          //   this.alertService.showWarning('Please enter effective date');
          // }
        }
        // Set old value if empty
        if (typeof item.Designation == 'object' || editCommand.serializedValue === '') {
          editCommand.serializedValue = originalObject[column.field];
        }
        // Set common properties
        editCommand.EmployeeId = item.Id;
        editCommand.EmployeeCode = item.Code;
        editCommand.EmployeeName = item.Name;
        editCommand.FieldName = column.field;
        editCommand.prevSerializedValue = originalObject ? originalObject[column.field] : editCommand.prevSerializedValue;
        // Update or push editCommand to _commandQueue
        const index = this._commandQueue.findIndex(e => e.FieldName === column.field && e.EmployeeId === item.Id);
        if (index !== -1) {
          this._commandQueue.splice(index, 1, editCommand);
        } else {
          this._commandQueue.push(editCommand);
        }
        // Execute editCommand
        editCommand.execute();
      }
    };
    // column definitions
    this.columnDefinitions = [{
      id: `Code`,
      name: `Code`,
      field: `Code`,
      filterable: true,
      minWidth: 60,
      sortable: true,
      // formatter: customCellFormatter
    }, {
      id: `Name`,
      name: `Emp. Name`,
      field: `Name`,
      filterable: true,
      minWidth: 60,
      sortable: true,
      // formatter: customCellFormatter
    }, {
      id: `Mobile`,
      name: `Mobile No.`,
      field: `Mobile`,
      filterable: true,
      minWidth: 60,
      sortable: true,
      editor: {
        model: Editors.integer,
        required: true,
        alwaysSaveOnEnterKey: false,
        validator: mobileNumberEditorValidator
      },
      onCellChange: (e: Event, args: OnEventArgs) => {}
    }, {
      id: `Designation`,
      name: `Designation`,
      field: `Designation`,
      filterable: true,
      minWidth: 60,
      sanitizeDataExport: true,
      sortable: true,
     formatter: (_row, _cell, value) => {
        if (value && value > 0) {
          const designation = this.originalData.Designation.find(a => Number(a.Id) === Number(value));
          return designation ? designation.Code : '';
        } else {
          return '';
        }
      },
      exportCustomFormatter: (_row, _cell, value) => {
        if (value && value > 0) {
          const designation = this.originalData.Designation.find(a => Number(a.Id) === Number(value));
          return designation ? designation.Code : '';
        } else {
          return '';
        }
      },
      editor: {
        placeholder: 'choose option',
        collection: this.Designation,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        // customStructure: {
        //   label: 'Code',
        //   value: 'Id',
        // },
        model: Editors.singleSelect,
        elementOptions: {
          filter: true,
          infiniteScroll: true
        },
        required: true
      },
      filter: {
        model: Filters.multipleSelect,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        filterOptions: {
          filter: true,
          infiniteScroll: true
        }
      }
    }, {
      id: `City`,
      name: `City`,
      field: `City`,
      filterable: true,
      minWidth: 60,
      sanitizeDataExport: true,
      sortable: true,
      formatter: (_row, _cell, value) => value && value > 0 ? this.originalData.City.find(a => Number(a.Id) === Number(value)).Code : value,
      exportCustomFormatter: (_row, _cell, value) => value && value > 0 ? this.originalData.City.find(a => Number(a.Id) === Number(value)).Code : value,
      editor: {
        placeholder: 'choose option',
        collection: this.City,
        model: Editors.singleSelect,
        elementOptions: {
          filter: true,
          infiniteScroll: true
        },
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        required: true
      }, filter: {
        model: Filters.multipleSelect,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        filterOptions: {
          filter: true,
          infiniteScroll: true
        }
      }
    }, {
      id: `Campus`,
      name: `Campus`,
      field: `Campus`,
      filterable: true,
      minWidth: 60,
      sanitizeDataExport: true,
      sortable: true,
      formatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Campus.find(a => Number(a.Id) === Number(value)).Code : value,
      exportCustomFormatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Campus.find(a => Number(a.Id) === Number(value)).Code : value,
      editor: {
        placeholder: 'choose option',
        collection: [],
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        // collectionOverride: (updatedCollection, args) => {
        //   console.log('***', args);
        //   return updatedCollection // .filter((col) => args.dataContext.id % 2 ? col.value < 50 : col.value > 50);
        // },
        model: Editors.singleSelect,
        elementOptions: {
          filter: true,
          infiniteScroll: true,
          onClick: (event) => {
            console.log(event);
            // const updateItem = this.angularGrid.gridService.getDataItemByRowIndex(this.rowInEditMode);
            // updateItem.status = +event.value;
            // this.angularGrid.gridService.updateItem(updateItem, { highlightRow: false });
            // this.angularGrid.gridService.renderGrid();
          }
        },
        required: true
      }, filter: {
        model: Filters.multipleSelect,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        filterOptions: {
          // placeholder: 'Search...',
          filter: true,
          infiniteScroll: true
        }
      }
    }, {
      id: `Department`,
      name: `Department`,
      field: `Department`,
      filterable: true,
      minWidth: 60,
      sanitizeDataExport: true,
      sortable: true,
      formatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Department.find(a => Number(a.Id) === Number(value)).Code : value,
      exportCustomFormatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Department.find(a => Number(a.Id) === Number(value)).Code : value,
      editor: {
        placeholder: 'choose option',
        collection: this.Department,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        model: Editors.singleSelect,
        elementOptions: {
          filter: true,
          infiniteScroll: true
        },
        required: true
      },
      filter: {
        model: Filters.multipleSelect,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        filterOptions: {
          // placeholder: 'Search...',
          filter: true,
          infiniteScroll: true
        }
      }
    }, {
      id: `Division`,
      name: `Division`,
      field: `Division`,
      filterable: true,
      minWidth: 60,
      sanitizeDataExport: true,
      sortable: true,
      type: FieldType.string,
      formatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Division.find(a => Number(a.Id) === Number(value)).Code : ' ',
      exportCustomFormatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Division.find(a => Number(a.Id) === Number(value)).Code : ' ',
      editor: {
        placeholder: 'choose option',
        collection: this.Division,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        model: Editors.singleSelect,
        elementOptions: {
          // placeholder: 'Search...',
          filter: true,
          infiniteScroll: true
        },
        required: true
      },
      filter: {
        model: Filters.multipleSelect,
        collectionSortBy: {
          property: 'label',
          sortDesc: false
        },
        filterOptions: {
          // placeholder: 'Search...',
          filter: true,
          infiniteScroll: true
        }
      },
    }];
  }

  async getData(): Promise<void> {
    try {
      const res = await this.employeeservice.getEmployeeMasterDataForCorrection(this.clientId, this.clientContractId, this.selectedCity).toPromise();
      console.log('API RES', res);
      if (res.Status && res.Result && res.Result != '') {
        const response = JSON.parse(res.Result);
        console.log('API RES 2', response);

        this.originalData = JSON.parse(JSON.stringify(response));
        if (this.originalData && this.originalData.EmployeeList && this.originalData.EmployeeList.length) {
          this.originalData.EmployeeList.forEach(employee => {
            const effectiveDate = employee.ApprovedEffectiveDate && employee.ApprovedEffectiveDate != '1900-01-01T00:00:00' ? employee.ApprovedEffectiveDate : (employee.RequestedEffectiveDate && employee.RequestedEffectiveDate != '1900-01-01T00:00:00' ? employee.RequestedEffectiveDate : null);
            employee.RequestedEffectiveDate = effectiveDate;
          });
        }
        // this.utilityservice.ensureIdUniqueness(this.originalData.EmployeeList);
        // this.setGridOptions(this.originalData);
        this.Department = response.Department.map(item => ({ label: item.Code, value: item.Id }));
        this.Campus = response.Campus.map(item => ({ label: item.Code, value: item.Id }));
        this.City = response.City.map(item => ({ label: item.Code, value: item.Id }));
        this.Designation = response.Designation.map(item => ({ label: item.Code, value: item.Id }));
        this.Division = response.Division.map(item => ({ label: item.Code, value: item.Id }));

        if (response && response.hasOwnProperty('Zone') && (!this.columnDefinitions.some(column => column.id === 'Zone'))) {
          const ZoneData = this.originalData.Zone.map(item => ({ label: item.Code, value: item.Id }))
          this.columnDefinitions.push({
            id: `Zone`,
            name: `Zone`,
            field: `Zone`,
            filterable: true,
            minWidth: 60,
            sanitizeDataExport: true,
            sortable: true,
            type: FieldType.string,
            formatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Zone.find(a => Number(a.Id) === Number(value)).Code : ' ',
            exportCustomFormatter: (_row, _cell, value) => value && value > 0 ? this.originalData.Zone.find(a => Number(a.Id) === Number(value)).Code : ' ',
            editor: {
              placeholder: 'choose option',
              collection: ZoneData,
              collectionSortBy: {
                property: 'label',
                sortDesc: false
              },
              model: Editors.singleSelect,
              elementOptions: {
                // placeholder: 'Search...',
                filter: true,
                infiniteScroll: true
              },
              required: true
            }, filter: {
              model: Filters.multipleSelect,
              collection: ZoneData,
              collectionSortBy: {
                property: 'label',
                sortDesc: false
              },
              filterOptions: {
                filter: true,
                infiniteScroll: true
              }
            }
          });
        }

        if (response && response.hasOwnProperty('JobProfile') && (!this.columnDefinitions.some(column => column.id === 'JobProfile'))) {
          const profileData = this.originalData.JobProfile.map(item => ({ label: item.Code, value: item.Id }));
          this.columnDefinitions.push({
            id: `JobProfile`,
            name: `JobProfile`,
            field: `JobProfile`,
            filterable: true,
            minWidth: 60,
            sanitizeDataExport: true,
            sortable: true,
            type: FieldType.string,
            formatter: (_row, _cell, value) => value && value > 0 ? this.originalData.JobProfile.find(a => Number(a.Id) === Number(value)).Code : ' ',
            exportCustomFormatter: (_row, _cell, value) => value && value > 0 ? this.originalData.JobProfile.find(a => Number(a.Id) === Number(value)).Code : ' ',
            editor: {
              placeholder: 'choose option',
              collection: profileData,
              collectionSortBy: {
                property: 'label',
                sortDesc: false
              },
              model: Editors.singleSelect,
              elementOptions: {
                // placeholder: 'Search...',
                filter: true,
                infiniteScroll: true
              },
              required: true
            },
            filter: {
              model: Filters.multipleSelect,
              collection: profileData,
              collectionSortBy: {
                property: 'label',
                sortDesc: false
              },
              filterOptions: {
                filter: true,
                infiniteScroll: true
              }
            }
          });
        }

        const managerValidator: EditorValidator = (value: string, args?: any) => {
          if (response && response.Manager) {
            // const usernameRegex = /([^(]*)/; // Extract username from the value
            // const matchResult = value.match(usernameRegex);
            // const username = matchResult ? matchResult[1].trim() : '';
            const matchFound = response.Manager.some(item => item.Username.trim().toLowerCase() === value.trim().toLowerCase());
            console.log('matchFound', matchFound);
            if (!matchFound) {
              this.alertService.showWarning('Please enter valid manager code');
              return { valid: false, msg: 'Please enter valid manager code' };
            }
          }

          return { valid: true, msg: null };
        }

        if (response && response.hasOwnProperty('Manager') && (!this.columnDefinitions.some(column => column.id === 'Manager'))) {
          // const ManagerData = this.originalData.ReportingManager.map(item => ({ label: item.Code, value: item.Id }));
          this.columnDefinitions.push({
            id: `Manager`,
            name: `Manager`,
            field: `Manager`,
            filterable: true,
            minWidth: 60,
            sortable: true,
            editor: {
              model: Editors.longText,
              required: true,
              alwaysSaveOnEnterKey: true,
              validator: managerValidator
            },
            onCellChange: (e: Event, args: OnEventArgs) => {
              console.log(args);
            }
          });
        }
        if (!this.columnDefinitions.some(column => column.id === 'RequestedEffectiveDate')) {
          this.columnDefinitions.push({
            id: 'RequestedEffectiveDate',
            name: 'Effective Date',
            field: 'RequestedEffectiveDate',
            minWidth: 60,
            filterable: true,
            sortable: true,
            formatter: Formatters.multiple,
            params: {
              formatters: [Formatters.complexObject, Formatters.dateIso]
            },
            type: FieldType.date,
            editor: {
              model: Editors.date,
            },
          })
        }
        // finally set status column
        if (!this.columnDefinitions.some(column => column.id === 'Status')) {
          this.columnDefinitions.push({
            id: 'Status',
            name: 'Status',
            field: 'Status',
            cssClass: 'right-align',
            sortable: true,
            filterable: true,
            filter: {
              model: Filters.singleSelect,
              collection: [{ value: '', label: 'All' }, { value: "0", label: 'No Change Requested' }, { value: "1", label: 'Pending For Approval' },
              { value: "2", label: 'Rejected' }, { value: "3", label: 'Approved' }],
            },
            formatter: (_row, _cell, value) => value === 2 ? `<span style=" display: inline-block;
            padding: .55em .8em;
            font-size: 90%;
            font-weight: 400;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: .375rem;
            transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #e63757;
            background-color: #fad7dd;">Rejected</span>` :
              value === 1 ? `<span style=" display: inline-block;
            padding: .55em .8em;
            font-size: 90%;
            font-weight: 400;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: .375rem;
            transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">
            Pending For Approval</span>` : value === 3 ? `<span style=" display: inline-block;
            padding: .55em .8em;
            font-size: 90%;
             font-weight: 400;
             line-height: 1;
             text-align: center;
             white-space: nowrap;
             vertical-align: baseline;
             border-radius: .375rem;
             transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #00d97e;
             background-color: #ccf7e5;">
                Approved</span>` : 'No Change Requested',
            exportCustomFormatter: (_row, _cell, value) => value === 2 ? 'Rejected' :
              value === 1 ? 'Pending For Approval' : value === 3 ? 'Approved' : 'No Change Requested'
          });
        }

        const divisonCol = this.columnDefinitions.find(column => column.id === 'Division');
        if (divisonCol) {
          divisonCol.editor.collection = this.Division;
          divisonCol.filter.collection = this.Division;
        }

        const deptCol = this.columnDefinitions.find(column => column.id === 'Department');
        if (deptCol) {
          deptCol.editor.collection = this.Department;
          deptCol.filter.collection = this.Department;
        }

        const caCol = this.columnDefinitions.find(column => column.id === 'Campus');
        if (caCol) {
          // caCol.editor.collection = this.Campus; //.find(a => Number(a.CityId) === Number(parentValue));
          caCol.filter.collection = this.Campus;
        }

        const cityCol = this.columnDefinitions.find(column => column.id === 'City');
        if (cityCol) {
          cityCol.editor.collection = this.City;
          cityCol.filter.collection = this.City;
        }

        const desCol = this.columnDefinitions.find(column => column.id === 'Designation');
        if (desCol) {
          desCol.editor.collection = this.Designation;
          desCol.filter.collection = this.Designation;
        }
        // SET DATA FOR TABLE GRID
        this.dataset = this.originalData.EmployeeList && this.originalData.EmployeeList.length ? JSON.parse(JSON.stringify(this.originalData.EmployeeList)) : [] //.slice(min, max) : [];
        return;
      } else {
        const message = res.Status ? 'No active employee(s) data found!' : res.Message;
        this.alertService.showWarning(message);
        this.spinner = false;
        throw new Error(res.Message);
      }
    } catch (err) {
      console.log('ERR IN MASTER DATA API', err);
      this.spinner = false;
      throw err;
    }
  }

  setGridOptions(data) {
    this.columnDefinitions = [];

    const columnDefinitions = [];

    for (const key in data.EmployeeList[0]) {
      if (key != 'Id' && key != 'IsEditable') {
        const columnDefinition = {
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2'), // Convert camelCase to Title Case
          field: key,
          filterable: true,
          minWidth: 60,
          sortable: true
        } as any;
  
        if (data[key]) {
          columnDefinition.type = FieldType.string;
          columnDefinition.formatter = (_row, _cell, value) => {
            if (value && value > 0) {
              const item = data[key].find(a => Number(a.Id) === Number(value));
              return item ? item.Code : value;
            }
            return value;
          };
          columnDefinition.exportCustomFormatter = (_row, _cell, value) => {
            if (value && value > 0) {
              const item = data[key].find(a => Number(a.Id) === Number(value));
              return item ? item.Code : value;
            }
            return value;
          };
          columnDefinition.editor = {
            placeholder: 'choose option',
            collection: this[key],
            collectionSortBy: {
              property: 'label',
              sortDesc: true
            },
            model: Editors.singleSelect,
            elementOptions: {
              filter: true,
              infiniteScroll: true
            },
            required: true
          };
        } else {
          columnDefinition.type = FieldType.string;
          columnDefinition.editor = {
            model: Editors.longText,
            required: true,
            alwaysSaveOnEnterKey: true
          };
        }

        columnDefinitions.push(columnDefinition);
      }
    }

    console.log(columnDefinitions);


  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
  }

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('clicked', args, metadata);
    this.changeEditable(metadata);
    // update campus drodpown based on city value
    if (metadata.columnDef.name === 'Campus') {
      const caCol = this.columnDefinitions.find(column => column.id === 'Campus');
      if (caCol) {
        const row = this.gridObj.getDataItem(args.row);
        const parentValue = row.City;
        let filteredVal = this.originalData.Campus.filter(a => Number(a.CityId) === Number(parentValue));
        let editorCollection = caCol.editor!.collection;
        editorCollection.length = 0;
        filteredVal.forEach(item => {
          editorCollection.push({ label: item.Code, value: item.Id });
        });
        console.log('filteredVal', caCol.editor);
      }
    }

    if (metadata.columnDef.name === 'Designation') {
      const designationColumn = this.columnDefinitions.find(column => column.id === 'Designation');
      if (designationColumn) {
        const row = this.gridObj.getDataItem(args.row);
        const categoryId = row.Category;
        let filteredDesignationValue = categoryId == 0 ? [] : this.originalData.Designation.filter(a => Number(a.CategoryId  ) === Number(categoryId));
        let designationEditorCollection = designationColumn.editor!.collection;
        designationEditorCollection.length = 0;
        filteredDesignationValue && filteredDesignationValue.length && filteredDesignationValue.forEach(item => {
          designationEditorCollection.push({ label: item.Code, value: item.Id });
        });
        console.log('filteredDesignationValue', designationColumn.editor);
      }
    }

    if (metadata.columnDef.name === 'City') {
      const campusColdef = this.columnDefinitions.find(column => column.id === 'Campus');
      if (campusColdef) {
        const row = this.gridObj.getDataItem(args.row);
        row.Campus = '';
      }
    }
  }

  onCellChanged(e: Event, args: any) {
    this.updatedObject = args.item;
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log('changed', args, metadata);
    if (metadata.columnDef.name === 'City') {
      const campusColdef = this.columnDefinitions.find(column => column.id === 'Campus');
      if (campusColdef) {
        const row = this.gridObj.getDataItem(args.row);
        row.Campus = '';
      }
    }
    Slick.GlobalEditorLock.commitCurrentEdit();
  }


  undo() {
    const command = this._commandQueue.pop();
    if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
      command.undo();
      this.gridObj.gotoCell(command.row, command.cell, true);
    }
  }

  save() {
    this.table_data = [];
    // Check if _commandQueue is valid and not empty
    if (this._commandQueue && this._commandQueue.length) {
      let fieldsWithBlankData = [];
      let effectiveDateFailed = [];
      this._commandQueue.forEach(d => {
        // Check for fields with blank data
        if (d.serializedValue === '' && d.prevSerializedValue != '') {
          fieldsWithBlankData.push(`${d.FieldName} (Employee: ${d.EmployeeName})`);
        }
      
        if (d.FieldName !== 'Mobile' && d.serializedValue != '' && (d.isEffectiveDateUpdated === undefined || d.isEffectiveDateUpdated === false)) {
          const emp = `${d.EmployeeName} (Employee Code: ${d.EmployeeCode})`;
          if (!effectiveDateFailed.includes(emp)) {
            effectiveDateFailed.push(emp);
          }
        }
      });
    
      // Show warnings for fields with no changes or blank data
      if(effectiveDateFailed.length > 0) {
        return this.alertService.showWarning(`Please update effective date for: ${effectiveDateFailed.join(', ')}`);
      } else if (fieldsWithBlankData.length > 0) {
        return this.alertService.showWarning(`There are few fields with blank data. Please update the fields: ${fieldsWithBlankData.join(', ')}`);
      } else {
        // If no warnings, proceed to populate table data
        this.populateTableData();
      }
    } else {
      this.alertService.showWarning('There were no changes to submit !');
    }

    // if (this._commandQueue && this._commandQueue.length) {
    //   console.log(this._commandQueue);
    //   if (this._commandQueue.some(d => d.serializedValue == d.prevSerializedValue)) {
    //     this.alertService.showWarning('There were no changes found !');
    //   } else if (this._commandQueue.every(d => (d.serializedValue != '' || d.prevSerializedValue != '')
    //     && !(d.serializedValue === '' && d.prevSerializedValue === ''))) {
    //     this.populateTableData();
    //   } else {
    //     this.alertService.showWarning('There are few fields with blank data. Please update those fields');
    //   }
    // }
  }

  private populateTableData(): void {
    this._commandQueue.forEach(e => {
      if (e.FieldName !== 'RequestedEffectiveDate' && e.prevSerializedValue != e.serializedValue) {
        if (e.FieldName == 'Manager' && e.prevSerializedValue.toLowerCase().includes(e.serializedValue.toLowerCase())) {
          e.serializedValue = e.prevSerializedValue;
        } else {
          const tempObj = this.createTempObject(e);
          this.table_data.push(tempObj);
        }
      }
    });
    console.log(this.table_data);
    if (this.table_data && this.table_data.length) {
      this.table_data = this.groupByEmployee(this.table_data);
      this.sortTableDataByEmployeeCode();
      this.showSlider = true;
    } else {
      if (this.table_data && this.table_data.length == 0) {
        this.alertService.showWarning('There were no changes to submit !');
      }
    }
  }

  groupByEmployee(data: any[]): any[] {
    const employeesMap = new Map();
    data.forEach(item => {
      const key = `${item.EmployeeCode}_${item.EmployeeName}`;
      if (!employeesMap.has(key)) {
        employeesMap.set(key, {
          rowspan: 1,
          items: [item]  
        });
      } else {
        const existingEmployee = employeesMap.get(key);
        existingEmployee.rowspan++;
        existingEmployee.items.push(item);  
      }
    });
    return Array.from(employeesMap.values());
  }


  private createTempObject(e): any {
    return {
      EmployeeCode: e.EmployeeCode,
      EmployeeName: e.EmployeeName,
      FieldName: e.FieldName,
      EffectiveDate: e.RequestedEffectiveDate ? e.RequestedEffectiveDate : moment().format('YYYY-MM-DD'),
      OldValue: e.prevSerializedValue && this.originalData[e.FieldName] && e.FieldName != 'Manager' ? this.originalData[e.FieldName].find(c => c.Id === Number(e.prevSerializedValue)).Code : Number(e.prevSerializedValue) == 0 ? '' : e.prevSerializedValue,
      NewValue: e.serializedValue && this.originalData[e.FieldName] && e.FieldName != 'Manager' ? this.originalData[e.FieldName].find(a => a.Id === Number(e.serializedValue)).Code : (typeof e.serializedValue == 'string' ? e.serializedValue.trim() : e.serializedValue)
    };
  }

  private sortTableDataByEmployeeCode(): void {
    this.table_data.sort((a, b) => {
      const codeA = parseInt(a.EmployeeCode);
      const codeB = parseInt(b.EmployeeCode);
      return codeA - codeB;
    });
  }

  changeEditable(metadata) {
    const data = metadata.dataContext;
    // dynamically change SlickGrid editable grid option
    let isEditable = true;

    const column = metadata.columnDef.id;
    const nonEditableColumns = environment.environment.NotAllowedColumnsToEdit;

    if (nonEditableColumns[this.roleCode] && nonEditableColumns[this.roleCode].includes(column)) {
      isEditable = false;
    }
    
    if (data.Status === StatusCode.PendingForApproval || (data.Status === StatusCode.Approved && environment.environment.AllowToEditApprovedRecordsInMasterData == false)) {
      isEditable = false;
    }
    this.angularGrid.slickGrid.setOptions({ editable: isEditable });
  }

  async refresh() {
    this.spinner = true;
    this._commandQueue = [];
    this.table_data = [];
    this.updatedObject = [];
    await this.getData();
    this.spinner = false;
    this.loadingScreenService.stopLoading();
  }

  transformData(savedData: any[]): any[] {
    try {
      return savedData.reduce((acc, item) => {
        if (item.FieldName.toLowerCase() != 'requestedeffectivedate' && item.prevSerializedValue.toString() === item.serializedValue.toString()) {
          return acc;
        }
        const existingItem = acc.find(x => x.EmployeeId === item.EmployeeId);
        const newData = {
          FieldName: item.FieldName,
          OldValue: item.prevSerializedValue && item.prevSerializedValue != '' ? item.prevSerializedValue : 0,
          NewValue: item.serializedValue.toString().trim()
        };
        if (item.FieldName.toLowerCase() != 'requestedeffectivedate' && existingItem) {
          existingItem.Data.push(newData);
        } else {
          if (item.FieldName.toLowerCase() != 'requestedeffectivedate') {
            acc.push({ EmployeeId: item.EmployeeId, RequestedEffectiveDate: moment(item.RequestedEffectiveDate).format('YYYY-MM-DD'), Data: [newData] });
          }
        }
        return acc;
      }, []);
    } catch (err) {
      console.log('errr in transformData', err);
    }
  }

  closeSlider() {
    this.table_data = [];
    this.showSlider = false;
  }

  submitEmployeeMasterData() {
    this.loadingScreenService.startLoading();
    const savedData = this.transformData(this._commandQueue);
    const data = {
      ClientId: this.clientId,
      ClientContractId: this.clientContractId,
      Data: JSON.parse(JSON.stringify(savedData))
    };
    console.log('savedData', data);
    // this.loadingScreenService.stopLoading();
    // return;
    this.employeeservice.insertEmployeeDataCorrectionLog(data).subscribe((result) => {
      // console.log('apiResponse', result);
      // this.loadingScreenService.stopLoading();
      if (result.Status) {
        this.alertService.showSuccess('Data updated successfully !');
        this.showSlider = false;
        this.refresh();
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(result.Message);
      }
    }, err => {
      this.loadingScreenService.stopLoading();
      console.log('ERR IN insertEmployeeDataCorrectionLog API', err);
    })
  }

  getManagerName(item) {
    // console.log(item);
    const mgrArr = this.originalData.Manager.find(m => m.Username == item.NewValue);
    return mgrArr ? `(${mgrArr.Name})` : '';
  }

  onCellValidation(e: Event, args: any) {
    if (args.validationResults) {
      this.alertService.showWarning(args.validationResults.msg);
    }
  }
  
  async onCitySearchClicked() {
    console.log(this.selectedCity);
    this.loadingScreenService.startLoading();
    this.spinner = true;
    this.table_data = [];
    this._commandQueue = [];
    await this.getData();
    this.showTable = true;
    this.spinner = false;
    this.loadingScreenService.stopLoading();
  }

  async getCityList(): Promise<void> {
    try {
      const res = await this.employeeservice.getCityList(this.clientId, this.clientContractId).toPromise();
      console.log('CITY RES', res);
      if (res.Status && res.Result && res.Result != '') {
        const response = JSON.parse(res.Result);
        console.log('CITY RES 2', response);
        this.citiesList = response;
        if (this.citiesList && this.citiesList.length == 1) {
          this.selectedCity = this.citiesList[0].Id;
          this.spinner = true;
          await this.getData();
          this.showTable = true;
        }
        return;
      } else {
        this.spinner = false;
        const message = res.Status ? 'No city is mapped!' : res.Message;
        this.alertService.showWarning(message);
        return;
      }
    } catch (err) {
      this.spinner = false;
      console.log('ERR IN MASTER DATA API', err);
      throw err;
    }
  }
  
}
