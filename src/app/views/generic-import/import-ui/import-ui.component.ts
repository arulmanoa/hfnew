import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ImportLayout, SaveExcelDataConfiguration, CreateExcelConfiguration } from '../import-models';
import { ImportLayoutService } from 'src/app/_services/service/import-layout.service';
import FileSaver from 'file-saver';
import { DataSourceType, SearchPanelType, InputControlType, RowSelectionType } from '../../personalised-display/enums';
import { RelationWithParent, FormInputControlType } from '../../generic-form/enums';
import { OneToManyInputType, ImportControlElementType, DataFormat, ApiRequestType } from '../import-enums';
import * as XLSX from 'xlsx';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SearchElement, DataSource } from '../../personalised-display/models';
import { AlertService } from 'src/app/_services/service/alert.service';
import { Column, GridOption, Filters, AngularGridInstance, FieldType } from 'angular-slickgrid';
import { PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import _ from 'lodash';
import { environment } from 'src/environments/environment';

//Note : 1. System will parse the data received from api after submission. So please send serialized data.

type AOA = any[][];


@Component({
  selector: 'app-import-ui',
  templateUrl: './import-ui.component.html',
  styleUrls: ['./import-ui.component.scss']
})
export class ImportUiComponent implements OnInit {

  database : ImportLayout[] = [
    {
      Id : 0,
      Code : 'RateSet',
      CreateExcelConfiguration  : { 
        DataSource : {
          Name : 'GetEmployeeId',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              FieldName : '@LowerId',
              DisplayName : 'Lower Limit',
              InputControlType : InputControlType.TextBox,
              Value : null,
              DropDownList : [],
              DataSource : null,
              ParentFields : null
            },
            {
              FieldName : '@UpperId',
              DisplayName : 'Upper Limit',
              InputControlType : InputControlType.TextBox,
              Value : null,
              DropDownList : [],
              DataSource :null,
              ParentFields : null
  
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : false,
          ClearButtonRequired : false
        }
      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
          'RatesetProduct' : {
            'EmployeeRateset' : {
              'Id' : 'EmployeeRatesetId'
            }
          },
        },
        UniqueIdentifiers : {},
      },
      ControlElementsList : [
        {
          Label : 'EmployeeId',
          FieldName : 'EmployeeId',
          PlaceHolder : 'Employee',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['EmployeeRateset']  
        },
        {
          Label : 'MonthlySalary',
          FieldName : 'MonthlySalary',
          PlaceHolder : 'Salary',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['EmployeeRateset']
        },
        { 
          Label : 'Product Code 1',
          FieldName : 'ProductCode',
          PlaceHolder : 'Code',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : [ 'RatesetProduct'],
          InputNumber : 0
        },
        {
          Label : 'Display Name 1',
          FieldName : 'DisplayName',
          PlaceHolder : 'Name',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['RatesetProduct'],
          InputNumber : 0,
        },
        {
          Label : 'Product Code 2',
          FieldName : 'ProductCode',
          PlaceHolder : 'Code',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : [ 'RatesetProduct'],
          InputNumber : 1, 
        },
        {
          Label : 'Display Name 2',
          FieldName : 'DisplayName',
          PlaceHolder : 'Name',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['RatesetProduct']  ,
          InputNumber : 1
        },
        
      ],
      ImportTree : {
        DataSource : {
          Type : DataSourceType.View,
          Name : 'EmployeeRateset',
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
       
        Children : [
          {
            DataSource: {
              Type : DataSourceType.View,
              Name : 'RatesetProduct',
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.OnetoMany,
            OneToManyInputType : OneToManyInputType.OneRowManyColumn,
            MaximumRowsAllowed : 2,
            
            Children : [],
          }
        ]
      },
      
      
    },
    {
      Id : 0,
      Code : 'test',
  
      ControlElementsList : [
        {
          Label : 'EmployeeId',
          FieldName : 'EmployeeId',
          PlaceHolder : 'Employee',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['EmployeeRateset']  
        },
        {
          Label : 'MonthlySalary',
          FieldName : 'MonthlySalary',
          PlaceHolder : 'Salary',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['EmployeeRateset']
        },
        { 
          Label : 'Product Code',
          FieldName : 'ProductCode',
          PlaceHolder : 'Code',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : [ 'RatesetProduct'],
          InputNumber : 0
        },
        {
          Label : 'Display Name',
          FieldName : 'DisplayName',
          PlaceHolder : 'Name',
          InputControlType : FormInputControlType.TextBox,  
          Value : null,
          Validators : [
            {
              Name : 'required',
              PropertyNameInError : 'required',
              InvalidMessage : 'This field is required'
            }
          ],
          ParentFields : [],
          EntityList : ['RatesetProduct'],
          InputNumber : 0,
        },

      ],
      ImportTree : {
        DataSource : {
          Type : DataSourceType.View,
          Name : 'EmployeeRateset',
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
        ControlElementsList : [
        ],
        Children : [
          {
            DataSource: {
              Type : DataSourceType.View,
              Name : 'RatesetProduct',
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.OnetoMany,
            OneToManyInputType : OneToManyInputType.ManyRowOneColumn,
            MaximumRowsAllowed : 2,
            ControlElementsList : [],
            Children : [],
          }
        ]
      },

      SaveExcelDataConfiguration : {
        EntityRelations : {
          'RatesetProduct' : {
            'EmployeeRateset' : {
              'Id' : 'EmployeeRatesetId'
            }
          },
        },
        UniqueIdentifiers : {
          'RatesetProduct' : ['A1'],
        }
      }
      
    },
    {
      Id : 0,
      Code : 'EmployeeAdjustment',
      
      ImportTree : {
        DataSource : {
          Name : 'EmployeeInvestmentDeductions',
          Type : DataSourceType.View,
          IsCoreEntity : false,
        },
        RelationWithParent : RelationWithParent.None,
        ControlElementsList : [
          {
            Label : 'Employee Id',
            FieldName : 'EmployeeID',
            EntityList : ['EmployeeInvestmentDeductions']
          },
          {
            Label : 'Financial Year Id',
            FieldName : 'FinancialYearId',
            EntityList : ['EmployeeInvestmentDeductions']
          },
          {
            Label : 'Product Id',
            FieldName : 'ProductID',
            EntityList : ['EmployeeInvestmentDeductions']
          },
          {
            Label : 'Amount',
            FieldName : 'Amount',
            EntityList : ['EmployeeInvestmentDeductions']
          },
          {
            Label : 'Details',
            FieldName : 'Details',
            EntityList : ['EmployeeInvestmentDeductions']
          },
          {
            Label : 'Inputs Remarks',
            FieldName : 'InputsRemarks',
            EntityList : ['EmployeeInvestmentDeductions']
          }
        ],
        Children : [
          {
            DataSource : {
              Name : 'EmployeeHouseRentDetails',
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.None,
            ControlElementsList : [
              {
                Label : 'Start Date',
                FieldName : 'StartDate',
                EntityList : ['EmployeeHouseRentDetails']
              },
              {
                Label : 'End Date',
                FieldName : 'EndDate',
                EntityList : ['EmployeeHouseRentDetails']
              },
              {
                Label : 'Rent Amount',
                FieldName : 'RentAmount',
                EntityList : ['EmployeeHouseRentDetails']
              },
              {
                Label : 'Address Details',
                FieldName : 'AddressDetails',
                EntityList : ['EmployeeHouseRentDetails']
              },
              {
                Label : 'IsMetro',
                FieldName : 'IsMetro',
                EntityList : ['EmployeeHouseRentDetails']
              },
              {
                Label : 'LandLord Details',
                FieldName : 'LandLordDetails',
                EntityList : ['EmployeeHouseRentDetails']
              },
              {
                Label : 'Inputs Remarks',
                FieldName : 'InputsRemarks',
                EntityList : ['EmployeeHouseRentDetails']
              },
              
            ],
            Children : []
          },
          {
            DataSource : {
              Name : 'EmployeeHousePropertyDetails',
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.None,
            Children : [],
            ControlElementsList : [
              {//[FirstTimeHomeOwner]
                Label : 'First Time Home Owner',
                FieldName : 'FirstTimeHomeOwner',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[LetOut]]
                Label : 'Let Out',
                FieldName : 'LetOut',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[AddressDetails]
                Label : 'Address Details',
                FieldName : 'AddressDetails',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[GrossAnnualValue]
                Label : 'Gross Annual Value',
                FieldName : 'GrossAnnualValue',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[MunicipalTax]]
                Label : 'Municipal Tax',
                FieldName : 'MunicipalTax',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[InterestAmount]
                Label : 'Interest Amount',
                FieldName : 'InterestAmount',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[PreConstructionInterestAmount]
                Label : 'PreConstruction Interest Amount',
                FieldName : 'PreConstructionInterestAmount',
                EntityList : ['EmployeeHousePropertyDetails']
              },
              {//[[InstallmentNumber]]
                Label : 'Installment Number',
                FieldName : 'InstallmentNumber',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[LoanDate]]
                Label : 'Loan Date',
                FieldName : 'LoanDate',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[PossessionDate]]
                Label : 'Possession Date',
                FieldName : 'PossessionDate',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[OwnershipPercentage]
                Label : 'Ownership Percentage',
                FieldName : 'OwnershipPercentage',
                EntityList : ['EmployeeHousePropertyDetails']

              },
            ]

          },
          {
            DataSource : {
              Name : 'ProductTest',
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.None,
            Children : [],
          }
        ]
      },
      ControlElementsList : [
        {//Employee Id
          Label : 'Employee Id',
          FieldName : 'EmployeeID',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          DataSource : {
            Name : 'Country',
            IsCoreEntity : false,
            Type : DataSourceType.View
          },
          DisplayField : "Name",
          Type : ImportControlElementType.Basic,
        },
        { //Financial
          Label : 'Financial Year Id',
          FieldName : 'FinancialYearId',
          InputControlType : FormInputControlType.TextBox,
          EntityList : ['EmployeeInvestmentDeductions'],
          Type : ImportControlElementType.Basic,

        },
        { //Product
          Label : 'Product Id',
          FieldName : 'ProductID',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          
        },
        { //Amount
          Label : 'Amount',
          FieldName : 'Amount',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          
        },
        { //Details
          Label : 'Details',
          FieldName : 'Details',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,

        },
        { //Input Remarks
          Label : 'Inputs Remarks',
          FieldName : 'InputsRemarks',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,

        },
        { // start date
          Label : 'Start Date',
          FieldName : 'StartDate',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //End date
          Label : 'End Date',
          FieldName : 'EndDate',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { // Rent
          Label : 'Rent Amount',
          FieldName : 'RentAmount',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { // Address
          Label : 'Address Details',
          FieldName : 'AddressDetails',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //IsMetro
          Label : 'IsMetro',
          FieldName : 'IsMetro',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //Landlord
          Label : 'LandLord Details',
          FieldName : 'LandLordDetails',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //Input remark
          Label : 'Inputs Remarks',
          FieldName : 'InputsRemarks',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        {//[FirstTimeHomeOwner]
          Label : 'First Time Home Owner',
          FieldName : 'FirstTimeHomeOwner',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[LetOut]]
          Label : 'Let Out',
          FieldName : 'LetOut',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[AddressDetails]
          Label : 'Address Details',
          FieldName : 'AddressDetails',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[GrossAnnualValue]
          Label : 'Gross Annual Value',
          FieldName : 'GrossAnnualValue',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[MunicipalTax]]
          Label : 'Municipal Tax',
          FieldName : 'MunicipalTax',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[InterestAmount]
          Label : 'Interest Amount',
          FieldName : 'InterestAmount',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[PreConstructionInterestAmount]
          Label : 'PreConstruction Interest Amount',
          FieldName : 'PreConstructionInterestAmount',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        {//[[InstallmentNumber]]
          Label : 'Installment Number',
          FieldName : 'InstallmentNumber',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[LoanDate]]
          Label : 'Loan Date',
          FieldName : 'LoanDate',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[PossessionDate]]
          Label : 'Possession Date',
          FieldName : 'PossessionDate',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,
          

        },
        {//[OwnershipPercentage]
          Label : 'Ownership Percentage',
          FieldName : 'OwnershipPercentage',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {
          FieldName : "",
          Type : ImportControlElementType.Dynamic,
          DataSource : {
            Name : 'Select * from Product where ProductGroupId = 1 for json auto',
            IsCoreEntity : false,
            Type : DataSourceType.None
          },
          DisplayField : 'Name',
          ValueField : 'Code',
          EntityList : ['ProductTest'],
        }
      ],

      CreateExcelConfiguration : {
        
        DataSource: {
          Name : 'GetEmployeeId',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              FieldName : '@LowerId',
              DisplayName : 'Lower Limit',
              InputControlType : InputControlType.TextBox,
              Value : null,
              DropDownList : [],
              DataSource : null,
              ParentFields : null
            },
            {
              FieldName : '@UpperId',
              DisplayName : 'Upper Limit',
              InputControlType : InputControlType.TextBox,
              Value : null,
              DropDownList : [],
              DataSource :null,
              ParentFields : null
  
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : false,
          ClearButtonRequired : false
        }
      },
      SaveExcelDataConfiguration : {

        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmployeeInvestementImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        }
      },
    },
    { 
      Id : 0,
      Code : 'EmployeeAdjustment',
      
      ImportTree : {
        DataSource : {
          Name : 'EmployeeInvestmentDeductions',
          Type : DataSourceType.View,
          IsCoreEntity : false,
        },
        RelationWithParent : RelationWithParent.None,
        ControlElementsList : [
          
        ],
        Children : [
          {
            DataSource : {
              Name : 'EmployeeHouseRentDetails',
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.None,
            ControlElementsList : [
            ],
            Children : []
          },
          {
            DataSource : {
              Name : 'EmployeeHousePropertyDetails',
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.None,
            Children : [],
            ControlElementsList : [
              {//[FirstTimeHomeOwner]
                Label : 'First Time Home Owner',
                FieldName : 'FirstTimeHomeOwner',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[LetOut]]
                Label : 'Let Out',
                FieldName : 'LetOut',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[AddressDetails]
                Label : 'Address Details',
                FieldName : 'AddressDetails',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[GrossAnnualValue]
                Label : 'Gross Annual Value',
                FieldName : 'GrossAnnualValue',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[MunicipalTax]]
                Label : 'Municipal Tax',
                FieldName : 'MunicipalTax',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[InterestAmount]
                Label : 'Interest Amount',
                FieldName : 'InterestAmount',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[PreConstructionInterestAmount]
                Label : 'PreConstruction Interest Amount',
                FieldName : 'PreConstructionInterestAmount',
                EntityList : ['EmployeeHousePropertyDetails']
              },
              {//[[InstallmentNumber]]
                Label : 'Installment Number',
                FieldName : 'InstallmentNumber',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[LoanDate]]
                Label : 'Loan Date',
                FieldName : 'LoanDate',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[[PossessionDate]]
                Label : 'Possession Date',
                FieldName : 'PossessionDate',
                EntityList : ['EmployeeHousePropertyDetails']

              },
              {//[OwnershipPercentage]
                Label : 'Ownership Percentage',
                FieldName : 'OwnershipPercentage',
                EntityList : ['EmployeeHousePropertyDetails']

              },
            ]

          },
         
        ]
      },
      ControlElementsList : [
        {//Employee Id
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        { //Financial
          Label : 'Financial Year Id',
          FieldName : 'FinancialYearId',
          InputControlType : FormInputControlType.TextBox,
          EntityList : ['EmployeeInvestmentDeductions'],
          Type : ImportControlElementType.Basic,

        },
        { //Product
          Label : 'Product Id',
          FieldName : 'ProductID',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          
        },
        { //Amount
          Label : 'Amount',
          FieldName : 'Amount',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          
        },
        { //Details
          Label : 'Details',
          FieldName : 'Details',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,

        },
        { //Input Remarks
          Label : 'Inputs Remarks',
          FieldName : 'InputsRemarks',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,

        },
        { // start date
          Label : 'Start Date',
          FieldName : 'StartDate',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //End date
          Label : 'End Date',
          FieldName : 'EndDate',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { // Rent
          Label : 'Rent Amount',
          FieldName : 'RentAmount',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { // Address
          Label : 'Address Details',
          FieldName : 'AddressDetails',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //IsMetro
          Label : 'IsMetro',
          FieldName : 'IsMetro',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //Landlord
          Label : 'LandLord Details',
          FieldName : 'LandLordDetails',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        { //Input remark
          Label : 'Inputs Remarks',
          FieldName : 'InputsRemarks',
          EntityList : ['EmployeeHouseRentDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        {//[FirstTimeHomeOwner]
          Label : 'First Time Home Owner',
          FieldName : 'FirstTimeHomeOwner',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[LetOut]]
          Label : 'Let Out',
          FieldName : 'LetOut',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[AddressDetails]
          Label : 'Address Details',
          FieldName : 'AddressDetails',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[GrossAnnualValue]
          Label : 'Gross Annual Value',
          FieldName : 'GrossAnnualValue',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[MunicipalTax]]
          Label : 'Municipal Tax',
          FieldName : 'MunicipalTax',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[InterestAmount]
          Label : 'Interest Amount',
          FieldName : 'InterestAmount',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[PreConstructionInterestAmount]
          Label : 'PreConstruction Interest Amount',
          FieldName : 'PreConstructionInterestAmount',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,

        },
        {//[[InstallmentNumber]]
          Label : 'Installment Number',
          FieldName : 'InstallmentNumber',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[LoanDate]]
          Label : 'Loan Date',
          FieldName : 'LoanDate',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        {//[[PossessionDate]]
          Label : 'Possession Date',
          FieldName : 'PossessionDate',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,
          

        },
        {//[OwnershipPercentage]
          Label : 'Ownership Percentage',
          FieldName : 'OwnershipPercentage',
          EntityList : ['EmployeeHousePropertyDetails'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.TextBox,


        },
        
      ],

      CreateExcelConfiguration : {
        
        DataSource: {
          Name : 'FillDataForEmployeeInvestementImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
  
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : false,
          ClearButtonRequired : false
        }
      },
      SaveExcelDataConfiguration : {

        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmployeeInvestementImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        }
      },
      
    },
    {//Investment
      Id : 3,
      Code : "EmployeeInvestment",
      Name : 'Employee Investment',
      CompanyId : 5,
      ImportTree : {
        DataSource : {
          Name : 'EmployeeInvestmentDeductions',
          Type : DataSourceType.View,
          IsCoreEntity : false,
        },
        RelationWithParent : RelationWithParent.None,
        Children : [],
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Pan Card
          Label : 'PAN Card',
          FieldName : 'PANCard',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Financial Year
          Label : 'Financial Year',
          FieldName : 'FinancialYear',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'CalendarBreakUp',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [    // !Change for selecting financial year based on condition
            
          ],
          DisplayField : 'Code'
        },
        {
          Label : '',
          FieldName : '',
          EntityList : ['EmployeeInvestmentDeductions'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Dynamic,
          DataSource : {
            Name : 'InvestmentProductView',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [],
          DisplayField : 'Name',
          ValueField : 'Name'
        }
        // { //life insurance premium
        //   Label : 'Life Insurance Premium',
        //   FieldName : 'LifeInsurancePremium',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // { //vol provident Fund
        //   Label : 'Voluntary Provident Fund',
        //   FieldName : 'VoluntaryProvidentFund',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // { // Public Provident Fund
        //   Label : 'Public Provident Fund',
        //   FieldName : 'PublicProvidentFund',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // { //Mutual Funds
        //   Label : 'Mutual Funds',
        //   FieldName : 'MutualFunds',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // { // Equity linked saving scheme
        //   Label : 'Equity Linked Savings Scheme',
        //   FieldName : 'EquityLinkedSavingsScheme',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },  
        // {// unit linked investment
        //   Label : 'UnitLinkedInvestmentPlan',
        //   FieldName : 'UnitLinkedInvestmentPlan',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {//infra bond
        //   Label : 'Infra Bonds',
        //   FieldName : 'InfraBonds',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {//nation savings
        //   Label : 'National Savings Certificate',
        //   FieldName : 'NationalSavingsCertificate',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {// interest on edu loan
        //   Label : 'Interest On Education Loan',
        //   FieldName : 'InterestOnEducationLoan',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // { //Sukanya samridhi
        //   Label : 'Sukanya Samridhi',
        //   FieldName : 'SukanyaSamridhi',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {//5-yyear deopsit
        //   Label : '5-Year Deposit Scheme',
        //   FieldName : '5YearDepositScheme',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {//Contribution to NPS
        //   Label : 'Additional Contribution To NPS',
        //   FieldName : 'AdditionalContributionToNPS',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {//Long Tern Infra
        //   Label : 'Long Term InfraBonds',
        //   FieldName : 'LongTermInfraBonds',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },
        // {// Rajiv Gandhi Equity
        //   Label : 'Rajiv Gandhi Equity Scheme',
        //   FieldName : 'RajivGandhiEquityScheme',
        //   EntityList : ['EmployeeInvestmentDeductions'],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic
        // },        
      ],
      CreateExcelConfiguration : {
        
        DataSource: {
          Name : 'FillDataForEmployeeInvestementImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              SendElementToGridDataSource : true,
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              SendElementToGridDataSource : true,
              MultipleValues : null,
  
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              SendElementToGridDataSource : true,
              Value: null
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        GridConfiguration : {
          DataSource: {
            Name : 'FillDataForEmployeeInvestementImport',
            Type : DataSourceType.SP,
            IsCoreEntity : false,
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true

      },
      SaveExcelDataConfiguration : {

        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmployeeInvestementImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DataFormat : DataFormat.EntityMappedData,
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "Life Insurance Premium",
              FieldName : "Life Insurance Premium",
              DisplayName : "Life Insurance Premium",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : 'Mutual Funds',
              FieldName : 'Mutual Funds',
              DisplayName : 'Mutual Funds',
              IsFilterable : true,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : false,
      },
      Status : true,
    },
    {// House Rent
      Id : 4,
      Code : "EmployeeHouseRent",
      Name : 'Employee House rent allowance',
      CompanyId : 5,
      ImportTree : {
        DataSource : {
          Name : 'EmployeeHouseRentDetails',
          Type : DataSourceType.View,
          IsCoreEntity : false,
        },
        RelationWithParent : RelationWithParent.None,
        Children : []
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Pan Card
          Label : 'PAN Card',
          FieldName : 'PANCard',
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Financial Year
          Label : 'Financial Year',
          FieldName : 'FinancialYear',
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'CalendarBreakUp',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [    // !Change for selecting financial year based on condition
            
          ],
          DisplayField : 'Code'
        },
        {
          Label : "Name of Landlord",
          FieldName : "LandLordName",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "PAN No. of Landlord",
          FieldName : "LandLordPAN",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "From Date",
          FieldName : "StartDate",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "ToDate",
          FieldName : "EndDate",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Rent Paid Amount",
          FieldName : "RentAmount",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Address of Residence",
          FieldName : "AddressDetails",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Is Metro City?",
          FieldName : "IsMetro",
          EntityList : ['EmployeeHouseRentDetails'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : [ {value : 'True'} ,{ value : 'False' }],
          DisplayField : 'value'
        },
        
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'FillDataForEmployeeInvestementImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              SendElementToGridDataSource : true,
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              SendElementToGridDataSource : true,
              MultipleValues : null,
  
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              SendElementToGridDataSource : true,
              Value: null
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        FillWithDataAllowed : true,
        GridConfiguration : {
          DataSource: {
            Name : 'FillDataForEmployeeInvestementImport',
            Type : DataSourceType.SP,
            IsCoreEntity : false,
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmployeeHouseRentImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DataFormat : DataFormat.EntityMappedData,
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "RentPaidAmount",
              FieldName : "Rent Paid Amount",
              DisplayName : "Rent",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : 'IsMetroCity',
              FieldName : 'Is Metro City?',
              DisplayName : 'Metro',
              IsFilterable : true,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : false,
      },
      Status : true,
    },  
    { // Huose Property
      Id : 5,
      Code : "EmployeeHouseProperty",
      Name : "Employee House Property Details",
      CompanyId : 5,
      ImportTree : {
        DataSource : {
          Name : "EmployeeDetails",
          Type : DataSourceType.View,
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
        Children : [
          {
            DataSource : {
              Name : "PropertyDetails",
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.OnetoMany,
            OneToManyInputType : OneToManyInputType.OneRowManyColumn,
            MaximumRowsAllowed : 2,
            Children : []
          }
        ]
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Pan Card
          Label : 'PAN Card',
          FieldName : 'PANCard',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Financial Year
          Label : 'Financial Year',
          FieldName : 'FinancialYear',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'CalendarBreakUp',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [    // !Change for selecting financial year based on condition
            
          ],
          DisplayField : 'Code'
        },
        {
          Label : "First Time Home Owner?",
          FieldName : "FirstTimeHomeOwner",
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : [ {value : 'True'} ,{ value : 'False' }],
          DisplayField : 'value'
        },
        {
          Label : "Is Let Out (Rented) ? (Property 1)",
          FieldName : "LetOut",
          EntityList : ['PropertyDetails'],
          InputNumber : 0,
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : [ {value : 'True'} ,{ value : 'False' }],
          DisplayField : 'value'
        },
        {
          Label : "Address Details (Property 1)",
          FieldName : "AddressDetails",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          InputNumber : 0,
        },
        {
          Label : "Gross Annual Rental Value (Property 1)",
          FieldName : "GrossAnnualValue",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Municipal Tax (Property 1)",
          FieldName : "MunicipalTax",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Principal Amount (Property 1)",
          FieldName : "PrincipalAmount",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Interest Amount (Property 1)",
          FieldName : "InterestAmount",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Loan Date (Property 1)",
          FieldName : "LoanDate",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Possession Date (Property 1)" ,
          FieldName : "PossessionDate",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Ownership Percentage (Property 1)",
          FieldName : "OwnershipPercentage",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Pre-Construction Interest Paid Amount (Property 1)",
          FieldName : "PreConstructionInterestAmount",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Installment Number (Property 1)",
          FieldName : "InstallmentNumber",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Lender PAN No. (Property 1)",
          FieldName : "LenderPANNO",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Address Of Lender (Property 1)",
          FieldName : "AddressOfLender",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 0,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Is Let Out (Rented)? (Property 2)",
          FieldName : "LetOut",
          EntityList : ['PropertyDetails'],
          InputNumber : 1,
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : [ {value : 'True'} ,{ value : 'False' }],
          DisplayField : 'value'
        },
        {
          Label : "Address Details (Property 2)",
          FieldName : "AddressDetails",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Gross Annual Rental Value (Property 2)",
          FieldName : "GrossAnnualValue",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Municipal Tax (Property 2)",
          FieldName : "MunicipalTax",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Principal Amount (Property 2)",
          FieldName : "PrincipalAmount",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Interest Amount (Property 2)",
          FieldName : "InterestAmount",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Loan Date (Property 2)",
          FieldName : "LoanDate",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Possession Date (Property 2)",
          FieldName : "PossessionDate",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Ownership Percentage (Property 2)",
          FieldName : "OwnershipPercentage",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Pre-Construction Interest Paid Amount (Property 2)",
          FieldName : "PreConstructionInterestAmount",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Installment Number (Property 2)",
          FieldName : "InstallmentNumber",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Lender PAN No. (Property 2)",
          FieldName : "LenderPANNO",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Address Of Lender (Property 2)",
          FieldName : "AddressOfLender",
          EntityList : ['PropertyDetails'],
          InputControlType : FormInputControlType.TextBox,
          InputNumber : 1,
          Type : ImportControlElementType.Basic
        },
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'FillDataForEmployeeInvestementImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              SendElementToGridDataSource : true,
              ParentHasValue : [],
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              SendElementToGridDataSource : true,
              MultipleValues : null,
  
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              SendElementToGridDataSource : true,
              Value: null
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        FillWithDataAllowed : true,
        GridConfiguration : {
          DataSource: {
            Name : 'FillDataForEmployeeInvestementImport',
            Type : DataSourceType.SP,
            IsCoreEntity : false,
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmployeeHousePropertyImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DataFormat : DataFormat.EntityMappedData,
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : false,
      },
      Status : true,
    },
    {// Investement Dependend
      Id : 0,
      Code : "InvestementDependend",
      ImportTree : {
        DataSource : {
          Name : "EmployeeDetails",
          Type : DataSourceType.View,
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
        Children : [
          {
            DataSource : {
              Name : "DependentDetails",
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            RelationWithParent : RelationWithParent.OnetoMany,
            OneToManyInputType : OneToManyInputType.ManyRowOneColumn,
            Children : []
          }
        ]
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Pan Card
          Label : 'PAN Card',
          FieldName : 'PANCard',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Financial Year
          Label : 'Financial Year',
          FieldName : 'FinancialYear',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Medical Insurance Premium - Self/ImmediateDependents (80D)",
          FieldName : "MEDINS_SELF",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "Medical Insurance Premium - Parents (80D)",
          FieldName : "MEDINS_PARENT",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "Medical Expenditure for Handicapped Dependents (80DD)",
          FieldName : "MEDINS_HANDI",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "DisabilityPercentage",
          FieldName : "DisabilityPercentage",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : "",
            Type : DataSourceType.FixedValues
          },
          DropDownList : [
            {
              Label : 40,
            },
            {
              Label : 80,
            }
          ],
          DisplayField : "Label"
        },
        {
          Label : "Medical Expenditure - Self (80DDB)",
          FieldName : "MEDEXP_SELF",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "Medical Expenditure - Dependents (80DDB)",
          FieldName : "MEDEXP_PARENT",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "Name of Dependent",
          FieldName : "DependentName",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "DOB of Dependent",
          FieldName : "DependentDateOfBirth",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {
          Label : "Relationship",
          FieldName : "Relationship",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : "",
            Type : DataSourceType.FixedValues
          },
          DropDownList : ["Father","Mother","Spouse","Son","Daughter","Guardian" ]
        },
        {
          Label : "Self Disability - (80U)",
          FieldName : "SELF_DISB",
          EntityList : ['DependentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'FillDataForEmployeeInvestementImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              SendElementToGridDataSource : true,
              ParentHasValue : [],
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              SendElementToGridDataSource : true,
              MultipleValues : null,
  
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              SendElementToGridDataSource : true,
              Value: null
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        FillWithDataAllowed : true,
        GridConfiguration : {
          DataSource: {
            Name : 'FillDataForEmployeeInvestementImport',
            Type : DataSourceType.SP,
            IsCoreEntity : false,
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {
          EmployeeDetails : ["A"]
        },
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmployeeInvestmentDependentImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DataFormat : DataFormat.EntityMappedData,
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "Life Insurance Premium",
              FieldName : "Life Insurance Premium",
              DisplayName : "Life Insurance Premium",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : 'Mutual Funds',
              FieldName : 'Mutual Funds',
              DisplayName : 'Mutual Funds',
              IsFilterable : true,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : false,
      },
      Status : true,
    },  
    { //PreviousEmployer
      Id : 0,
      Code : "PreviousEmployer",
      ImportTree : {
        DataSource : {
          Name : "EmploymentDetails",
          Type : DataSourceType.View,
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
        Children : []
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Pan Card
          Label : 'PAN Card',
          FieldName : 'PANCard',
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Financial Year
          Label : 'Financial Year',
          FieldName : 'FinancialYear',
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Previous Annual Income",
          FieldName : "GrossSalary",
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Previous Employer PF",
          FieldName : "PreviousPF",
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Previous Employer PT",
          FieldName : "PreviousPT",
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : "Previous Deducted TDS",
          FieldName : "TaxDeducted",
          EntityList : ['EmploymentDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'FillDataForEmployeeInvestementImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              SendElementToGridDataSource : true,
              ParentHasValue : [],
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              SendElementToGridDataSource : true,
              MultipleValues : null,
  
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              SendElementToGridDataSource : true,
              Value: null
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        FillWithDataAllowed : true,
        GridConfiguration : {
          DataSource: {
            Name : 'FillDataForEmployeeInvestementImport',
            Type : DataSourceType.SP,
            IsCoreEntity : false,
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
          EmployeeHouseRentDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          },
          EmployeeHousePropertyDetails : {
            EmployeeInvestmentDeductions : {
              'EmployeeID' : 'EmployeeID',
              'FinancialYearId' : 'FinancialYearId'
            }
          }
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmploymentDetailsImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DataFormat : DataFormat.EntityMappedData,
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "Life Insurance Premium",
              FieldName : "Life Insurance Premium",
              DisplayName : "Life Insurance Premium",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : 'Mutual Funds',
              FieldName : 'Mutual Funds',
              DisplayName : 'Mutual Funds',
              IsFilterable : true,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : false,
      },
      Status : true,

    },
    {//Bank Upload
      Id : 6,
      Code : 'BankUpload',
      Name : 'Bank Upload',
      CompanyId : 5,
      ImportTree : {
        DataSource : {
          Name : "Bank",
          Type : DataSourceType.View,
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
        Children : []
      },
      ControlElementsList : [
        {//Employee Id
          Label : 'EmployeeId',
          FieldName : 'EmployeeId',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Code
          Label : 'EmployeeCode',
          FieldName : 'EmployeeCode',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'EmployeeName',
          FieldName : 'EmployeeName',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Client Name
          Label : 'ClientName',
          FieldName : 'ClientName',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//PaytransactionId
          Label : 'PayTransactionId',
          FieldName : 'PaytransactionId',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//BankName
          Label : 'BankName',
          FieldName : 'BankName',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//IFSCCode
          Label : 'IFSCCode',
          FieldName : 'IFSCCode',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//AccountNumber
          Label : 'AccountNumber',
          FieldName : 'AccountNumber',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Narration
          Label : 'Narration',
          FieldName : 'Narration',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Status
          Label : 'Status',
          FieldName : 'Status',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//AcknowledgmentDetail
          Label : 'AcknowledgmentDetail',
          FieldName : 'AcknowledgmentDetail',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//IsPaymentDone
          Label : 'IsPaymentDone',
          FieldName : 'IsPaymentDone',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//NetPay
          Label : 'NetPay',
          FieldName : 'NetPay',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//PaymentDate
          Label : 'PaymentDate',
          FieldName : 'PaymentDate',
          EntityList : ["Bank"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
      ],
      CreateExcelConfiguration : {
        DataSource : {
          Name : 'GetPayOutDetailsForUpload',
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "GetPayOutDetailsForUpload",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name",
              Width : 0
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "PayPeriodName",
              FieldName : "PayPeriodName",
              DisplayName : "PayPeriod Name",
              IsFilterable : true,
              Width : 0
            },
          ],
          ShowDataOnLoad : false,
          IsPaginationRequired : false,
          EnableColumnReArrangement : true,
          IsColumnPickerRequired : true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: [],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "ClientView",
                Type: 1
              },
              DefaultValue : "0",
              DisplayFieldInDataset : "ClientName",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : "@clientcontractId",
              SendElementToGridDataSource : true
            } ,
            {
              FieldName : '@processCategory',
              DisplayName : 'Transaction Type',
              Value : null,
              DataSource : {
                Name : '',
                Type : DataSourceType.FixedValues,
              },
              DropDownList : [
                {
                  label : 'Salary',
                  value : 1
                },
                {
                  label : 'Adhoc Payment',
                  value : 2
                },
                {
                  label : 'Reimbursement',
                  value : 3
                },
                {
                  label : 'FnF',
                  value : 4
                },
              ],
              ForeignKeyColumnNameInDataset : 'value',
              DisplayFieldInDataset : 'label',
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              FieldName : '@month',
              DisplayName : 'Month',
              Value : null,
              DataSource : {
                Name : 'MonthView',
                Type : DataSourceType.View,
                IsCoreEntity : false
              },
              DropDownList : [],
              ForeignKeyColumnNameInDataset : 'Id',
              DisplayFieldInDataset : 'MName',
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              FieldName : '@year',
              DisplayName : 'Year',
              Value : null,
              DataSource : {
                Name : 'YearView',
                Type : DataSourceType.View,
                IsCoreEntity : false
              },
              DropDownList : [],
              ForeignKeyColumnNameInDataset : 'Year',
              DisplayFieldInDataset : 'Year',
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            }
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : false,
        ApiName : 'api/PayOut/UpdateBankPayOutInformation',
        ApiRequestType : ApiRequestType.put,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmploymentDetailsImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DisplayDataGridAfterApiResult : true,
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "FillDataForSalaryRevisionImport",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "EmployeeId",
              FieldName : "EmployeeId",
              DisplayName : "Employee Id",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "PayTransactionId",
              FieldName : "PayTransactionId",
              DisplayName : "PayTransactionId",
              IsFilterable : true,
            },
            {
              Id : "NetPay",
              FieldName : "NetPay",
              DisplayName : "NetPay",
              IsFilterable : true,
            }

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        ApiResultGridConfiguration : {
          DataSource : {
            Name : '',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeId",
              FieldName : "EmployeeId",
              DisplayName : "Employee Id",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "StatusDisplay",
              FieldName : "StatusDisplay",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "Message",
              FieldName : "Message",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        ShowAlertWarningIfFailed : false,
        DataFormat : DataFormat.RawData
      },
      Status : true
    },
    {// Salary Revision
      Id : 1,
      Code : "SalaryRevision",
      Name : 'Employee Salary Revision',
      CompanyId : 5,
      ImportTree : {
        DataSource : {
          Name : "RateSet",
          Type : DataSourceType.View
        },
        RelationWithParent : RelationWithParent.None,
        Children : [
          {
            DataSource : {
              Name : "RateSetProduct",
              Type : DataSourceType.View
            },
            RelationWithParent : RelationWithParent.None,
            Children : [],
            ControlElementsList : []
          }
        ],
        ControlElementsList : []
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Pan Card
          Label : 'PAN Card',
          FieldName : 'PANCard',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        
        {//State
          Label : 'State',
          FieldName : 'State',
          EntityList : ['RateSet'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'State',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : 'Status',
              Value : 1
            }
          ],
          DisplayField : 'Name',
          
        },
        {//Industry
          Label : 'Industry',
          FieldName : 'Industry',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'Industry',
            Type : DataSourceType.View,
            IsCoreEntity : true
          },
          Type : ImportControlElementType.Basic,
          DisplayField : "Name"
        },
        {//Skill Category
          Label : 'Skill Category',
          FieldName : 'SkillCategory',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'GroupedSkillCategoryView',
            Type : DataSourceType.View,
            IsCoreEntity : true
          },
          DisplayField : "name",
          Type : ImportControlElementType.Basic,
          ParentFields : ["State" , "Industry"],
        },
        {//Zone
          Label : 'Zone',
          FieldName : 'Zone',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'GroupedZoneView',
            Type : DataSourceType.View,
            IsCoreEntity : true
          },
          DisplayField : "Name",
          Type : ImportControlElementType.Basic,
          ParentFields : ["State" , "Industry"],
        },
        {// Pay group Id
          Label : 'Pay Group Id',
          FieldName : 'PayGroupId',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {// Pay group
          Label : 'Pay Group',
          FieldName : 'PayGroup',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'PayGroupContractView',
            IsCoreEntity : false,
            Type : DataSourceType.View
          },
          SearchElements : [
            {
              FieldName : "ClientContractId",
              Value : 4
            }
          ],
          DisplayField : 'Name',

          
        },
        {// Effective date
          Label : "Effective Date",
          FieldName : "EffectiveDateInt",
          EntityList : ["RateSet"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic

        },
        {// Pay period
          Label : "Effective Pay Period",
          FieldName : "EffectivePeriod",
          EntityList : ["RateSet"],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'GetPayPeriodNamesUsingTeam',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : '@teamId',
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : '@teamId',
              Value : null
              
            },
            // {
            //   DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
            //   DefaultValue: "218",
            //   DisplayFieldInDataset: "Name",
            //   DisplayName: "Team Name",
            //   DropDownList: [],
            //   FieldName: "@teamId",
            //   ForeignKeyColumnNameInDataset: "Id",
            //   InputControlType: 2,
            //   IsIncludedInDefaultSearch: true,
            //   MultipleValues: [],
            //   TriggerSearchOnChange: false,
            //   Value: null,
            //   GetValueFromUser : true,
            //   RefrenceFieldNameInSearchElements : '@teamId',
            //   SendElementToGridDataSource : true,

            // },
          ],
          DisplayField : 'PayCyclePeriodName',
        },
        {// Mail Employee
          Label : 'Mail Employee',
          FieldName : "SendMailImmediately",
          EntityList : ["RateSet"],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : ['True' , 'False'],
        },
        {//CC mail ids
          Label : 'CC MailIds',
          FieldName : "CCMailIds",
          EntityList : ["RateSet"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
        },
        {//Letter Template
          Label : "Letter Template",
          FieldName : "LetterTemplate",
          EntityList : ["RateSet"],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'GetTemplateDetails',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : '@clientId',
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : "@clientcontractId",
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Company Name",
              DropDownList: [],
              FieldName: "@companyId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : "@companyId",
              SendElementToGridDataSource : true
            },
            {
              DisplayName : "",
              FieldName : '@categoryCode',
              Value : 'Revision',
              GetValueFromUser : false,
              DisplayFieldInDataset : 'Name',
              ForeignKeyColumnNameInDataset : 'Id',
              InputControlType : InputControlType.DropDown,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              SendElementToGridDataSource : true,
            },
          ],
          DisplayField : "Name",
          ValueField : "Id"
        },
        {//Annual Salary
          Label : 'Annual Salary',
          FieldName : "AnnualSalary",
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Salary Type
          Label : 'Salary Type',
          FieldName : 'SalaryBreakUpType',
          EntityList : ['RateSet'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : "",
            Type : DataSourceType.FixedValues
          },
          DropDownList : ["CTC" , "GROSS" , "NetPay"],
          Type : ImportControlElementType.Basic
        },
        {// Auto Breakup
          Label : 'Is Auto Breakup',
          FieldName : "IsAutoBreakUp",
          EntityList : ["RateSet"],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : [ {value : 'True'} ,{ value : 'False' }],
          DisplayField : 'value',
          ParentFields : [],
        },
        {// Products
          FieldName : '',
          Type : ImportControlElementType.Dynamic,
          DataSource : {
            Name : 'GetPaygroupProducts',
            IsCoreEntity : false,
            Type : DataSourceType.SP
          },
          SearchElements : [
            
            {
              DisplayName : "Pay Group",
              FieldName : '@paygroupId',
              Value : null,
              GetValueFromUser : true,
              DataSource : {
                Name : "select * from paygroup where Id in (4,5,6,7,8,9) for json auto",
                Type : DataSourceType.None,
                IsCoreEntity : false
              },
              DisplayFieldInDataset : 'Name',
              ForeignKeyColumnNameInDataset : 'Id',
              InputControlType : InputControlType.DropDown,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              SendElementToGridDataSource : true,
              RefrenceFieldNameInSearchElements : "@paygroupId"
            },
            
          ],
          DisplayField : 'Name',
          ValueField : 'ProductCode',
          EntityList : ['RateSetProduct'],
          

        }

        
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'FillDataForSalaryRevisionImport',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "0",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '0',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "0",
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              DisplayName : "Pay Group",
              FieldName : '@paygroupId',
              Value : null,
              GetValueFromUser : true,
              DataSource : {
                // Name : "select * from paygroup where Id in (4,5,6,7,8,9) for json auto",
                Name : "PayGroupContractView",
                Type : DataSourceType.View,
                IsCoreEntity : false
              },
              DefaultValue : 5,
              DisplayFieldInDataset : 'Name',
              ForeignKeyColumnNameInDataset : 'PayGroupId',
              InputControlType : InputControlType.DropDown,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              DropDownList : [],
              ParentFields : ['@clientcontractId'],
              ParentHasValue : [],
              SendElementToGridDataSource : true,
            },
            {
              FieldName : "@companyId",
              Value : null,
              GetValueFromUser : false,
              IsIncludedInDefaultSearch : false
            },
          ],
          
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "FillDataForSalaryRevisionImport",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true


      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : false,
        ApiName : 'api/Employee/InsertBulkELCTransaction',
        ApiRequestType : ApiRequestType.post,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmploymentDetailsImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "FillDataForSalaryRevisionImport",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "Annual Salary",
              FieldName : "Annual Salary",
              DisplayName : "Annual Salary",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : 'Is Auto Breakup',
              FieldName : 'Is Auto Breakup',
              DisplayName : 'Is Auto Breakup',
              IsFilterable : true,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "FillDataForSalaryRevisionImport",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "StatusDisplay",
              FieldName : "StatusDisplay",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "Message",
              FieldName : "Message",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
        
      },
      Status : true

    },
    {//New Joinee Update
      Id : 7,
      Code : 'NewJoineeUpdate',
      Name : 'New Joinee Data Update',
      CompanyId : 5,
      Status : true,
      ImportTree : { 
        DataSource : {
          Name : 'EmploymentContract',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : []

      },
      ControlElementsList : [
         {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {
          Label : 'Team',
          FieldName : 'Team',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'Team',
            IsCoreEntity : false,
            Type : DataSourceType.View
          },
          SearchElements : [
            {
              FieldName : 'ClientContractId',
              Value : null,
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : '@clientcontractId'
            }
          ],
          DisplayField : 'Name'
        },
        {
          Label : 'Month PayPeriod',
          FieldName : 'Month',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'MonthView',
            IsCoreEntity : false,
            Type : DataSourceType.View
          },
          SearchElements : [
          ],
          DisplayField : 'MName'

        },
        {
          Label : 'Year PayPeriod',
          FieldName : 'Year',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'YearView',
            IsCoreEntity : false,
            Type : DataSourceType.View
          },
          SearchElements : [
          ],
          DisplayField : 'Year'
        }
      ],
      CreateExcelConfiguration : { 
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
          ],
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : true
        },
        GridConfiguration : {
          DataSource : {
            Name : "FillDataForNewJoineeUpdate",
            Type : DataSourceType.View,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        ApiName : 'api/Employee/InsertBulkELCTransaction',
        ApiRequestType : ApiRequestType.post,
        UseGeneralSP : false,
        DataSource : {
          Name : "UpdateNewJoineeData",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "EmployeeCode",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "ClientName",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Team",
              FieldName : "Team",
              DisplayName : "Team Name",
              IsFilterable : true,

              Width : 0
            }, 
          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "FillDataForSalaryRevisionImport",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "StatusDisplay",
              FieldName : "StatusDisplay",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "Message",
              FieldName : "Message",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
        
      },
    },
    {// Bulk Resignation
      Id : 8,
      Code : 'BulkResignation',
      Name : 'Employee Resignation',
      CompanyId : 5,
      Status : true,
      ImportTree : { 
        DataSource : {
          Name : 'EmployeeFnFTransaction',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : [
          {
            DataSource : {
              Name : 'AttendanceInputs',
              Type : DataSourceType.View
            },
            RelationWithParent : RelationWithParent.None,
            Children : [],
            ControlElementsList : []
          },
          {
            DataSource : {
              Name : 'AllowanceInputs',
              Type : DataSourceType.View
            },
            RelationWithParent : RelationWithParent.None,
            Children : [],
            ControlElementsList : []
          }
        ]

      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {//Resignation Date
          Label : 'Resignation Date',
          FieldName : 'ResignationDate',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : 'Resignation Reason',
          FieldName : 'ResignationReason',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'GetResignationReasonsUsingClientContractId',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : '@clientcontractId',
              Value : null,
              GetValueFromUser : true,
              DefaultValue : 0,
              RefrenceFieldNameInSearchElements : '@clientcontractId'
            },
            
          ],
          DisplayField : 'Name',
        },
        {//Attendance Start Date
          Label : 'Attendance Start Date',
          FieldName : 'AttendanceStartDate',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//LWD
          Label : 'LWD',
          FieldName : 'LWD',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//IsNillCase
          Label : 'IsNillCase',
          FieldName : 'IsNillCase',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues,
            IsCoreEntity : false
          },
          DropDownList : ['True' , 'False']
        },
        {// Dynamic Attendance inputs
          Label : '',
          FieldName : '',
          EntityList : ['AttendanceInputs'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Dynamic,
          DataSource : {
            Name : 'GetAttendanceInputColumnsForBulkResignation',
            IsCoreEntity : false,
            Type : DataSourceType.SP
          },
          SearchElements : [
            
            {
              DisplayName : "Pay Group",
              FieldName : '@teamId',
              Value : null,
              GetValueFromUser : true,
              DefaultValue : 0,
              RefrenceFieldNameInSearchElements : '@teamId'
              // DataSource : {
              //   Name : "",
              //   Type : DataSourceType.None,
              //   IsCoreEntity : false
              // },
              // DisplayFieldInDataset : 'Name',
              // ForeignKeyColumnNameInDataset : 'Id',
              // InputControlType : InputControlType.DropDown,
              // IsIncludedInDefaultSearch : true,
              // TriggerSearchOnChange : false,
              // MultipleValues : null,
              // DropDownList : [],
              // ParentFields : null,
              // ParentHasValue : [],
              // SendElementToGridDataSource : true,
              // RefrenceFieldNameInSearchElements : "@paygroupId"
            },
            
          ],
          DisplayField : 'ColumnName',
          ValueField : 'FieldName',
        },
        {//NoticePeriodDays
          Label : 'NoticePeriod Days',
          FieldName : 'NoticePeriodDays',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//NoticePeriod Rule
          Label : 'NoticePeriod Rule',
          FieldName : 'NoticePeriodRule',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'FnFRulesView',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : 'ProductCode',
              Value : 'NoticePeriodPayment'
            },
            
          ],
          DisplayField : 'Name',
        },
        {//Recover Days
          Label : 'Recovery Days',
          FieldName : 'RecoveryDays',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Recover Rule
          Label : 'Recover Rule',
          FieldName : 'RecoveryRule',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'FnFRulesView',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : 'ProductCode',
              Value : 'NoticePeriodRecovery'
            },
            
          ],
          DisplayField : 'Name',
        },
        {//Recovery Calculation
          Label : 'Recovery Calculation',
          FieldName : 'RecoveryCalculation',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues,
            IsCoreEntity : false
          },
          DropDownList : ['Automatic' , 'Manual']
        },
        {//Recovery Amount
          Label : 'Recovery Amount',
          FieldName : 'RecoveryAmount',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Leave Encashment Days
          Label : 'Leave Encashment Days',
          FieldName : 'LeaveEncashmentDays',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Leave Encashment Rule
          Label : 'Leave Encashment Rule',
          FieldName : 'LeaveEncashmentRule',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'FnFRulesView',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : 'ProductCode',
              Value : 'LeaveEncashAmount'
            },
            
          ],
          DisplayField : 'Name',
        },
        {//LeaveEncash Calculation
          Label : 'LeaveEncash Calculation',
          FieldName : 'LeaveEncashmentCalculation',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues,
            IsCoreEntity : false
          },
          DropDownList : ['Automatic' , 'Manual']
        },
        {//LeaveEncashAmount
          Label : 'LeaveEncash Amount',
          FieldName : 'LeaveEncashmentAmount',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Gratuity Period
          Label : 'Gratuity Period(Years)',
          FieldName : 'GratuityPeriod',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Gratuity Rule
          Label : 'Gratuity Rule',
          FieldName : 'GratuityRule',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'FnFRulesView',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : 'ProductCode',
              Value : 'Gratuity'
            },
            
          ],
          DisplayField : 'Name',
        },
        {//GratuityCalculation
          Label : 'Gratuity Calculation',
          FieldName : 'GratuityCalculation',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues,
            IsCoreEntity : false
          },
          DropDownList : ['Automatic' , 'Manual']
        },
        {//GratuityAmount
          Label : 'Gratuity Amount',
          FieldName : 'GratuityAmount',
          EntityList : ['EmployeeFnFTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Allowance Products
          Label : 'Allowance Products',
          FieldName : '',
          EntityList : ['AllowanceInputs'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Dynamic,
          DataSource : {
            Name : 'GetAllowanceProductUsingTeamId',
            IsCoreEntity : false,
            Type : DataSourceType.SP
          },
          SearchElements : [
            
            {
              DisplayName : "TeamId",
              FieldName : '@teamId',
              Value : null,
              GetValueFromUser : true,
              DefaultValue : 0,
              RefrenceFieldNameInSearchElements : '@teamId'
            },
            
          ],
          DisplayField : 'Name',
          ValueField : 'Code',
        }
       
        
      ],
      CreateExcelConfiguration : {  
        DataSource: {
          Name : 'GetBulkFnFUIList',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: 0,
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
          ],
          
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "GetBulkFnFUIList",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              IsCustomFilter : true,
              CustomFilterComponentName : 'CommaSeparatedStringsFilterComponent',
              CustomFilterHandler : 'CommaSeparatedStringFilterHandler',
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name",
              IsFilterable : true,
              IsCustomFilter : true,
              CustomFilterComponentName : 'CommaSeparatedStringsFilterComponent',
              CustomFilterHandler : 'CommaSeparatedStringFilterHandler',
              Width :0
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : false,
        ApiName : 'api/ELC/InsertBulkFnFTransaction',
        ApiRequestType : ApiRequestType.put,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmploymentDetailsImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "LWD",
              FieldName : "LWD",
              DisplayName : "LWD",
              IsFilterable : true,
              Formatter : "ExcelNumberToDate",
              IsGridFormatter : true,
              Width : 0
            },  
            
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "StatusDisplay",
              FieldName : "Status",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "Message",
              FieldName : "ErrorMessage",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
        
      },
    },
    {//Bulk COntract Extension
      Id : 9,
      Code : 'ContractExtension',
      Name : 'Employee Contract Extension',
      CompanyId : 5,
      Status : true,
      ImportTree : { 
        DataSource : {
          Name : 'EmployeeLifeCycleTransaction',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : []

      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeLifeCycleTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeLifeCycleTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeLifeCycleTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Contract End Date
          Label : 'Contract End Date',
          FieldName : 'ContractEndDate',
          EntityList : ['EmployeeLifeCycleTransaction'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Mail Employee
          Label : 'Mail Employee',
          FieldName : "SendMailImmediately",
          EntityList : ["EmployeeLifeCycleTransaction"],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : '',
            Type : DataSourceType.FixedValues
          },
          DropDownList : ['True' , 'False'],
        },
        {//Letter Template
          Label : "Letter Template",
          FieldName : "LetterTemplate",
          EntityList : ["EmployeeLifeCycleTransaction"],
          InputControlType : FormInputControlType.DropDown,
          Type : ImportControlElementType.Basic,
          DataSource : {
            Name : 'GetTemplateDetails',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : "1846",
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : '@clientId',
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : '230',
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : "@clientcontractId",
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "218",
              DisplayFieldInDataset: "Name",
              DisplayName: "Company Name",
              DropDownList: [],
              FieldName: "@companyId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : true,
              RefrenceFieldNameInSearchElements : "@companyId",
              SendElementToGridDataSource : true
            },
            {
              DisplayName : "",
              FieldName : '@categoryCode',
              Value : 'Revision',
              GetValueFromUser : false,
              DisplayFieldInDataset : 'Name',
              ForeignKeyColumnNameInDataset : 'Id',
              InputControlType : InputControlType.DropDown,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              SendElementToGridDataSource : true,
            },
          ],
          DisplayField : "Name",
          ValueField : "Id"
        },

      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'GetActiveEmployeeUIList',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: 0,
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              DataSource: {Type: 1, Name: "", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "[]",
              DisplayFieldInDataset: "Name",
              DisplayName: "Employee Codes",
              DropDownList: [],
              FieldName: "@employeeCodes",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: InputControlType.CommaSeparatedStrings,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: [],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            }
          ],
          
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "GetActiveEmployeeUIList",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : false,
        ApiName : 'api/ELC/InsertBulkContractExtension',
        ApiRequestType : ApiRequestType.put,
        UseGeneralSP : false,
        DataSource : {
          Name : "EmploymentDetailsImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "SendMailImmediately",
              FieldName : "Mail Employee",
              DisplayName : "Send Mail",
              IsFilterable : true,

              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "Status",
              FieldName : "Status",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "ErrorMessage",
              FieldName : "ErrorMessage",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
        
      },
    },
    {//Employee ESIC
      Id : 10,
      Code : 'EmployeeESIC',
      Name : 'Employee ESIC',
      CompanyId : 5,
      Status : true,
      ImportTree : { 
        DataSource : {
          Name : 'EmployeeDetails',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : []

      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {
          Label : 'ESIC',
          FieldName : 'ESIC',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : 'Remarks',
          FieldName : 'Remarks',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'GetActiveEmployeeUIList',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: 0,
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              DataSource: {Type: 1, Name: "", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "[]",
              DisplayFieldInDataset: "Name",
              DisplayName: "Employee Codes",
              DropDownList: [],
              FieldName: "@employeeCodes",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: InputControlType.CommaSeparatedStrings,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: [],
              ParentHasValue: [],
              ReadOnly: false,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            }
          ],
          
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "GetActiveEmployeeUIList",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        ApiName : 'api/ELC/InsertBulkContractExtension',
        ApiRequestType : ApiRequestType.put,
        UseGeneralSP : false,
        DataSource : {
          Name : "UpdateEmployeeESICNumber",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "ESIC",
              FieldName : "ESIC",
              DisplayName : "ESIC",
              IsFilterable : true,

              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "Status",
              FieldName : "Status",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "ErrorMessage",
              FieldName : "ErrorMessage",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
        
      },
    },
    {//Employee ESIC
      Id : 11,
      Code : 'EmployeePFAndUAN',
      Name : 'Employee PF & UAN',
      CompanyId : 5,
      Status : true,
      ImportTree : { 
        DataSource : {
          Name : 'EmployeeDetails',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : []

      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {
          Label : 'PF',
          FieldName : 'PF',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : 'UAN',
          FieldName : 'UAN',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {
          Label : 'Remarks',
          FieldName : 'Remarks',
          EntityList : ['EmployeeDetails'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'GetActiveEmployeeUIList',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: 0,
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              DataSource: {Type: 1, Name: "", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "[]",
              DisplayFieldInDataset: "Name",
              DisplayName: "Employee Codes",
              DropDownList: [],
              FieldName: "@employeeCodes",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: InputControlType.CommaSeparatedStrings,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: [],
              ParentHasValue: [],
              ReadOnly: false,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            }
          ],
          
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "GetActiveEmployeeUIList",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        ApiName : 'api/ELC/InsertBulkContractExtension',
        ApiRequestType : ApiRequestType.put,
        UseGeneralSP : false,
        DataSource : {
          Name : "UpdateEmployeePFAndUAN",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "PF",
              FieldName : "PF",
              DisplayName : "PF",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "UAN",
              FieldName : "UAN",
              DisplayName : "UAN",
              IsFilterable : true,

              Width : 0
            }

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "Status",
              FieldName : "Status",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "ErrorMessage",
              FieldName : "ErrorMessage",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
        
      },
    },
    {// Employee Notice Period
      Id : 12,
      Code : 'EmployeeNoticePeriod',
      Name : 'Employee Notice Period',
      CompanyId : 5 ,
      Status : true,
      ImportTree : {
        DataSource : {
          Name : 'EmploymentContract',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : []
      },
      ControlElementsList : [
        {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Notice Period
          Label : 'Notice Period',
          FieldName : 'NoticePeriodDays',
          EntityList : ['EmploymentContract'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
      ],
      CreateExcelConfiguration : {
        DataSource: {
          Name : 'GetActiveEmployeeUIList',
          Type : DataSourceType.SP,
          IsCoreEntity : false,
        },
        SearchConfiguration : {
          SearchElementList : [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : "Name",
              FieldName : "@clientId",
              DisplayName : 'Client Name',
              ForeignKeyColumnNameInDataset : "Id",
              InputControlType : InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch : true,
              TriggerSearchOnChange : false,
              MultipleValues : null,
              Value : null,
              DropDownList : [],
              ParentFields : null,
              ParentHasValue : [],
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            { 
              DataSource : {
                IsCoreEntity : false,
                Name : "clientcontract",
                Type : 1
              },
              DefaultValue : 0,
              DisplayFieldInDataset : 'Name',
              FieldName : "@clientcontractId",
              DisplayName : 'Contract Name',
              ForeignKeyColumnNameInDataset : "Id",
              IsIncludedInDefaultSearch : true,
              InputControlType : InputControlType.AutoFillTextBox,
              Value : null,
              TriggerSearchOnChange : false,
              ReadOnly : true,
              DropDownList : [],
              ParentHasValue : [],
              ParentFields : ["@clientId"],
              MultipleValues : null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            } ,
            {
              DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
              DefaultValue: 0,
              DisplayFieldInDataset: "Name",
              DisplayName: "Team Name",
              DropDownList: [],
              FieldName: "@teamId",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: 2,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: ["@clientcontractId"],
              ParentHasValue: [],
              ReadOnly: true,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            },
            {
              DataSource: {Type: 1, Name: "", EntityType: 0, IsCoreEntity: false},
              DefaultValue: "[]",
              DisplayFieldInDataset: "Name",
              DisplayName: "Employee Codes",
              DropDownList: [],
              FieldName: "@employeeCodes",
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: InputControlType.CommaSeparatedStrings,
              IsIncludedInDefaultSearch: true,
              MultipleValues: [],
              ParentFields: [],
              ParentHasValue: [],
              ReadOnly: false,
              RelationalOperatorValue: null,
              RelationalOperatorsRequired: false,
              TriggerSearchOnChange: false,
              Value: null,
              GetValueFromUser : false,
              SendElementToGridDataSource : true
            }
          ],
          
          SearchPanelType : SearchPanelType.Panel,
          SearchButtonRequired : true,
          ClearButtonRequired : false
        },
        GridConfiguration : {
          DataSource : {
            Name : "GetActiveEmployeeUIList",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "ClientName",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "DOJ",
              FieldName : "DOJ",
              DisplayName : "Date of Joining",
              IsFilterable : true,
              Width : 0,
              DataType : "date"
            },
            {
              Id : "NoticePeriodDays",
              FieldName : "NoticePeriodDays",
              DisplayName : "Notice Period",
              IsFilterable : true,
              Width : 0,
            }

          ],
          ButtonList : [],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },
        FillWithDataAllowed : true
      },
      SaveExcelDataConfiguration : {
        DataFormat : DataFormat.EntityMappedData,
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        UseGeneralApi : true,
        ApiName : 'api/ELC/InsertBulkContractExtension',
        ApiRequestType : ApiRequestType.put,
        UseGeneralSP : false,
        DataSource : {
          Name : "UpdateBulkNoticePeriod",
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        BeforeUploadGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [  
            {
              Id : "Employee Code",
              FieldName : "Employee Code",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "Employee Name",
              FieldName : "Employee Name",
              DisplayName : "Employee Name",
              IsFilterable : true,
            },
            {
              Id : "Client Name",
              FieldName : "Client Name",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },  
            {
              Id : "Notice Period",
              FieldName : "Notice Period",
              DisplayName : "Notice Period",
              IsFilterable : true,

              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : false,
          RowSelectionType : RowSelectionType.Multiple
        },
        DisplayDataGridAfterApiResult : true,
        ApiResultGridConfiguration : {
          DataSource : {
            Name : "",
            Type : DataSourceType.SP,
            IsCoreEntity : false, 
          },  
          ColumnDefinitionList : [
            {
              Id : "EmployeeCode",
              FieldName : "EmployeeCode",
              DisplayName : "Employee Code",
              IsFilterable : true,
              Width : 0
            },
            {
              Id : "EmployeeName",
              FieldName : "EmployeeName",
              DisplayName : "Employee Name"
            },
            {
              Id : "ClientName",
              FieldName : "ClientName",
              DisplayName : "Client Name",
              IsFilterable : true,

              Width : 0
            },
            {
              Id : "Status",
              FieldName : "Status",
              DisplayName : "Status",
              IsFilterable : true,
              Width : 0,

            },
            {
              Id : "ErrorMessage",
              FieldName : "ErrorMessage",
              DisplayName : "Error Message",
              IsFilterable : false,
              Width : 0
            }
            

          ],
          ShowDataOnLoad: true,
          IsPaginationRequired: false,
          DisplayFilterByDefault: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          IsSummaryRequired: false,
          IsGroupingEnabled: false,
          DefaultGroupingFields: ["Code", "Name"],
          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: true,

          //Row Selection
          IsMultiSelectAllowed : true,
          RowSelectionCheckBoxRequired : true,
          RowSelectionType : RowSelectionType.Multiple
        },

        ShowAlertWarningIfFailed : true,
        WarningMessage : "Notice Period updation for some records have failed! Please check grid for details."
        
      },
    },
    {//Onboarding
      Id : 13,
      Code : 'Onboarding',
      Name : 'Onbaording',
      CompanyId : 1,
      Status : true,
      ImportTree : {
        DataSource : {
          Name : 'Candidate',
          Type : DataSourceType.View,
        } ,
        RelationWithParent : RelationWithParent.None,
        Children : []
      },
      ControlElementsList: [
        {//ClientCode
          Label : 'ClientCode',
          FieldName : 'ClientCode',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//ContractCode
          Label : 'ContractCode',
          FieldName : 'ContractCode',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//ClientSpoc
          Label : 'ClientSpoc',
          FieldName : 'ClientSpoc',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//SourceType
          Label : 'SourceType',
          FieldName : 'SourceType',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//RequestFor
          Label : 'OnBoardingType',
          FieldName : 'OnBoardingType',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//CandidateName
          Label : 'CandidateName',
          FieldName : 'CandidateName',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Gender
          Label : 'Gender',
          FieldName : 'Gender',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Aadhaar
          Label : 'Aadhaar',
          FieldName : 'Aadhaar',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//DOB
          Label : 'DOB',
          FieldName : 'DOB',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//FatherName
          Label : 'FatherName',
          FieldName : 'FatherName',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//MobileNumber
          Label : 'MobileNumber',
          FieldName : 'MobileNumber',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//EmailId
          Label : 'EmailId',
          FieldName : 'EmailId',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Nationality
          Label : 'Nationality',
          FieldName : 'Nationality',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//ClientLocation
          Label : 'ClientLocation',
          FieldName : 'ClientLocation',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//State
          Label : 'State',
          FieldName : 'State',
          EntityList : ['Candidate'],
          Type : ImportControlElementType.Basic,
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'State',
            Type : DataSourceType.View,
            IsCoreEntity : false
          },
          SearchElements : [
            {
              FieldName : 'Status',
              Value : 1
            }
          ],
          DisplayField : 'Name',
        },
        {//Industry
          Label : 'Industry',
          FieldName : 'Industry',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'Industry',
            Type : DataSourceType.View,
            IsCoreEntity : true
          },
          Type : ImportControlElementType.Basic,
          DisplayField : "Name"
        },
        {//SkillCategory
          Label : 'SkillCategory',
          FieldName : 'SkillCategory',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'GroupedSkillCategoryView',
            Type : DataSourceType.View,
            IsCoreEntity : true
          },
          DisplayField : "name",
          Type : ImportControlElementType.Basic,
          ParentFields : ["State" , "Industry"],
        },
        {//Zone
          Label : 'Zone',
          FieldName : 'Zone',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'GroupedZoneView',
            Type : DataSourceType.View,
            IsCoreEntity : true
          },
          DisplayField : "Name",
          Type : ImportControlElementType.Basic,
          ParentFields : ["State" , "Industry"],
        },
        {//PayGroup
          Label : 'PayGroup',
          FieldName : 'PayGroup',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//IsMonthlySalary
          Label : 'IsMonthlySalary',
          FieldName : 'IsMonthlySalary',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Salary
          Label : 'Salary',
          FieldName : 'Salary',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Designation
          Label : 'Designation',
          FieldName : 'Designation',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//DOJ
          Label : 'DOJ',
          FieldName : 'DOJ',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//ContractEndate
          Label : 'ContractEndate',
          FieldName : 'ContractEndate',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//OnCostInsuranceAmount
          Label : 'OnCostInsuranceAmount',
          FieldName : 'OnCostInsuranceAmount',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//OnCostDeductionAmount
          Label : 'OnCostDeductionAmount',
          FieldName : 'OnCostDeductionAmount',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//GMC_Amount
          Label : 'GMC_Amount',
          FieldName : 'GMC_Amount',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//GPA_Amount
          Label : 'GPA_Amount',
          FieldName : 'GPA_Amount',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//NoticePeriodDays
          Label : 'NoticePeriodDays',
          FieldName : 'NoticePeriodDays',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//LetterTemplate
          Label : 'LetterTemplate',
          FieldName : 'LetterTemplate',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//IsAutoBreakup
          Label : 'IsAutoBreakup',
          FieldName : 'IsAutoBreakup',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Basic
          Label : 'Basic',
          FieldName : 'Basic',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//DA
          Label : 'DA',
          FieldName : 'DA',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//HRA
          Label : 'HRA',
          FieldName : 'HRA',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Bonus
          Label : 'Bonus',
          FieldName : 'Bonus',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//DepAllow
          Label : 'DepAllow',
          FieldName : 'DepAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//VehicleReimb
          Label : 'VehicleReimb',
          FieldName : 'VehicleReimb',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//TelePhoneAllow
          Label : 'TelePhoneAllow',
          FieldName : 'TelePhoneAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//PDR
          Label : 'PDR',
          FieldName : 'PDR',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//LTA
          Label : 'LTA',
          FieldName : 'LTA',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//EduAllow
          Label : 'EduAllow',
          FieldName : 'EduAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//FoodAllow
          Label : 'FoodAllow',
          FieldName : 'FoodAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//HardshipAllow
          Label : 'HardshipAllow',
          FieldName : 'HardshipAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//WashingAllow
          Label : 'WashingAllow',
          FieldName : 'WashingAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//FarmAllow
          Label : 'FarmAllow',
          FieldName : 'FarmAllow',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Incentive
          Label : 'Incentive',
          FieldName : 'Incentive',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Gross
          Label : 'Gross',
          FieldName : 'Gross',
          EntityList : ['Candidate'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        }
      ],
      CreateExcelConfiguration : {
        SearchConfiguration : {
          SearchElementList : [],
          SearchPanelType : SearchPanelType.None
        }
      },
      SaveExcelDataConfiguration : {
        UniqueIdentifiers : {}
      }
    }
  ]

  //General
  importLayoutList : ImportLayout[];
  importLayout : ImportLayout = null;
  uploadedImportLayout : ImportLayout = null;
  code : string = null;
  disableCodeInput : boolean = false;
  fillExcel : boolean = false;
  fullSpinner : boolean = false;;
  spinner : boolean = false;
  apiResultReceived : boolean = false;
  file : File;
  @ViewChild("fileInput") inputFile : ElementRef;
  uploaded : boolean = false;
  submitted : boolean = false;
  activeTabName : string;

  //For Search Bar
  searchElemetsList : SearchElement[];

  // For Grid
  columnDefinition : Column[];
  gridOptions : GridOption;
  dataset : any[];
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  selectedItems : any[];
  rows : any[];

  //Grid beforeUpload
  beforeUploadColumnDefinition : Column[];
  beforeUploadGridOptions : GridOption;
  beforeUploadDataset : any[];
  beforeUploadAngularGrid: AngularGridInstance;
  beforeUploadGridObj: any;
  beforeUploadDataviewObj: any;
  beforeUploadselectedItems : any[];
  

  //Grid ApiResult
  apiResultColumnDefinition : Column[];
  apiResultGridOptions : GridOption;
  apiResultDataset : any[];
  apiResultAngularGrid: AngularGridInstance;
  apiResultGridObj: any;
  apiResultDataviewObj: any;
  apiResultselectedItems : any[];

  //Grouping
  draggableGroupingPlugin: any;

  //Session Details
  sessionDetails : LoginResponses;
  companyId : number;
  BusinessType : number;

  constructor(
    private importLayoutService : ImportLayoutService,
    private route: ActivatedRoute,
    private alertService : AlertService,
    private router : Router,
    private pageLayoutService : PagelayoutService,
    private loadingScreenService : LoadingScreenService,
    private sessionDetailsService : SessionStorage,
  ) 
  { }

  ngOnInit() {
    //this.importLayout = this.database[4];

    // console.log("URL test ::" ,  new URL( environment.environment.API_BASE_URL + 'api/Values/EncryptedGet?value=5&value1=8'));

    // console.log("Calling ENcryted get");
    // this.pageLayoutService.getUsingObj().subscribe(data => {
    //   console.log("Encrypted get result ::" , data);
    //   } , error => {
    //     console.error(error);
    //   }
    // )
    
    // * Uncomment to Upload bulk upload configuration
    // #region For Uploading configuration 
    // this.importLayoutService.postImportLayout(this.database.find((x) => 
    // { x.LastUpdatedBy = new Date().toISOString(); return x.Code == "Onboarding"})).subscribe( data => {
    //   console.log(data);
    //   if(data.Status){
    //     this.alertService.showSuccess("Import Layout added successfully!");
    //   }
    //   else{
    //     this.alertService.showWarning(data.Message);
    //   }
    // } , error => {
    //   console.error(error);
    //   this.alertService.showWarning("Error Occured while saving import layout!");
    // })
    //#endregion
    
    this.sessionDetails = JSON.parse(this.sessionDetailsService.getSessionStorage(SessionKeys.LoginResponses));
    // console.log('session' , this.sessionDetails)
    this.companyId = this.sessionDetails.Company.Id;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;

    let dataSource : DataSource = {
      Name : 'ImportLayout',
      Type : DataSourceType.View,
      IsCoreEntity : false
    }

    let searchElements : SearchElement[] = [
      {
        FieldName : 'CompanyId',
        Value : this.companyId
      },
      {
        FieldName : 'Status',
        Value : true
      }
    ]

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.code = params.get('code');
      if(this.code !== null && this.code !== undefined){
        this.disableCodeInput = true;
      }
      else{
        this.disableCodeInput = false;
      }
    })
    console.log(this.code);

    

    this.fullSpinner = true;
    this.pageLayoutService.getDataset(dataSource,searchElements).subscribe( data => {
      this.fullSpinner = false;
      if(data.Status && data.dynamicObject != null && data.dynamicObject != ''){
        let list = JSON.parse(data.dynamicObject);
        for(let el of list){
          el.ControlElementsList = JSON.parse(el.ControlElementsList.toString());
          el.SaveExcelDataConfiguration = JSON.parse(el.SaveExcelDataConfiguration);
          el.CreateExcelConfiguration = JSON.parse(el.CreateExcelConfiguration);
          el.ImportTree = JSON.parse(el.ImportTree);
        }
        this.importLayoutList = list;
        console.log('list ::' , this.importLayoutList);

        if(this.code !== null && this.code !== undefined){
          this.onCodeChange();
        }

      }
      else{
        this.alertService.showWarning(data.Message);
        this.router.navigate['app/dashboard'];
      }
      
    } , error => {
      this.fullSpinner = false;
      this.alertService.showWarning("Something went wrong!");
      console.error(error);
      this.router.navigate(['app/dahsboard']);
    })

  }

  onClickingDownloadTemplateButton(){

    this.spinner = true;
    // this.importLayout = this.database.find( x => x.Code === this.code);
    console.log(this.importLayout);

    if(this.selectedItems != null && this.selectedItems.length <= 0){
      this.selectedItems = null;
    }

    
      for(let controlElement of this.importLayout.ControlElementsList){
        
        if(controlElement.SearchElements != undefined && controlElement.SearchElements != null 
          && controlElement.SearchElements.length >= 0){
            for(let searchElement of controlElement.SearchElements){
              if(searchElement.GetValueFromUser){
                // this.searchElemetsList.push(searchElement);
                let refrenceSearchElement = this.searchElemetsList.find( x => x.FieldName == searchElement.RefrenceFieldNameInSearchElements );
                if(refrenceSearchElement != null){
                  searchElement.Value = refrenceSearchElement.Value;
                }
              }
            }
        }
      }

    this.importLayoutService.getExcelTemplate(this.importLayout , this.selectedItems , this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList).subscribe(
      data => {
        this.spinner = false;
        console.log(data);
        if(data.Status){
          this.base64ToBlob(data.dynamicObject , 'Template');
        }
        else{
          this.alertService.showWarning(data.Message);
        }
      },
      error => {
        this.spinner = false;
        console.log(error);
      }
    )
  }

  onUploadButtonClicked(){
    console.log("clicked");
    this.file = null;
    this.inputFile.nativeElement.files = null;
    this.inputFile.nativeElement.value = '';
    this.uploaded = false;
  }

  handleFileInput(files: FileList) {

    
    this.file                 = files.item(0); 
    //const file                = files.item(0);
    const RELATION            = "Relation";
    const ONETOMANYINPUTTYPE  = "OneToManyInputType";
    const MAXIMUMROWSALLOWED  = "MaximumRowsAllowed";
    const NOOFCONTROLELEMENTS = "NoOfControlElements";
    const CELLREFRENCES       = "CellRefrences";
    // const formData = new FormData();
    
    // formData.append(file.name, file);

    // this.importLayoutService.uploadExcel(formData).subscribe(
    //   data => {
    //     console.log(data);
    //   }, error => {
    //     console.log(error);
    //   }
    // );

    if(this.file == undefined ||  this.file == null){
      this.alertService.showWarning("Please select a file to process");
      return;
    }

    console.log(this.file);

    const reader = new FileReader();
    let base64File; 
    // reader.onload = (event) => {


    //   const data = reader.result.toString();  
    //   base64File = btoa(data);
    //   // console.log(base64File);
    //   // console.log(data);
    //   this.importLayoutService.uploadExcelData(base64File).subscribe(
    //     data => {
    //       console.log(data);
    //     }, error => {
    //       console.log(error);
    //     }
    //   );

      
    // }

    reader.onload = (e: any) => {

      this.loadingScreenService.startLoading();
      try{
        this.fillExcel = false;
        this.spinner = true;
  
        let rows  : any[] = [];
  
        let row = {};
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  
        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  
        /* save data */
        let data = <AOA>(XLSX.utils.sheet_to_json(ws));
        console.log(data); 
  
        
  
        var range = XLSX.utils.decode_range(ws['!ref']);
  
        if(ws['ZZ1'].v === undefined || ws['AAA1'].v === undefined || ws['AAC1'].v === undefined){
          this.alertService.showWarning("Error Parsing the template. Please upload the template downloaded from the system");
          this.loadingScreenService.stopLoading();
          return;
        }
  
        let dataSourceObject = JSON.parse(ws['ZZ1'].v);
        let uniqueIdentifiers = JSON.parse(ws['AAA1'].v);
        this.uploadedImportLayout = JSON.parse(ws['AAC1'].v);
        //this.onImportLayoutChange();
        console.log("Uploaded Import Layout :: " , this.uploadedImportLayout);
  
        this.beforeUploadDataset = [];
        for(let rowNum = range.s.r+2; rowNum <= range.e.r+1; rowNum++){
          let row : any = {};
          let blankCheck : number = 0;
          console.log('columns' ,range.s.c , range.e.c);
          for(let colNum : number = range.s.c; colNum <= range.e.c; colNum++){
            let column : string = this.columnLetter(colNum)
            let cell : string = column + rowNum.toString();
              //console.log(cell);  
            if(ws[cell] != undefined){
              row[ws[column + "1"].v] = ws[cell].v; 
              blankCheck = 0;
            }
            else{
              ++blankCheck;
            }
            if(blankCheck >= 15){
              break;
            }
          }
          row["Id"] = rowNum;
          this.beforeUploadDataset.push(row);
        }
        console.log("Before Upload Dataset :: " , this.beforeUploadDataset);
  
        //Data Formar : Raw Data
        if(this.uploadedImportLayout.SaveExcelDataConfiguration.DataFormat == undefined || 
          this.uploadedImportLayout.SaveExcelDataConfiguration.DataFormat == DataFormat.RawData){
          rows = data; 
        }
        //Data Format : Entity Mapped
        else{
          let uniqueIdentifierObject = {};
  
        
          console.log(uniqueIdentifiers);
          console.log(dataSourceObject);
          
  
          // for(let key of Object.keys(uniqueIdentifiers)){
          //   uniqueIdentifierObject[key] = {};
          // }
  
          let entityNames = Object.keys(dataSourceObject); 
          let uniquekeys = Object.keys(uniqueIdentifiers);
          let  firstEntity : string = null;
          if(uniquekeys.length > 0)
            firstEntity = uniquekeys[0];
  
          let str : string = '';
          // console.log(range);
          for(let rowNum = range.s.r+2; rowNum <= range.e.r+1; rowNum++){
            row = {};
            row["Id"] = rowNum;
            str = '';
            
            if(firstEntity != null){
              for(let column of uniqueIdentifiers[firstEntity]){
                str += ws[column + rowNum.toString()].v.toString().trim();
              }
            }
            
            // console.log(rowNum);
            // console.log(str);
  
            let index = Object.keys(uniqueIdentifierObject).indexOf(str);
            
            // console.log(index);
            
            //If similar row already exists
            if( index >= 0 ){
              let  existingRowIndex : number = uniqueIdentifierObject[str];
  
              for(let entity of entityNames){
                if(dataSourceObject[entity][RELATION] == RelationWithParent.OnetoMany && dataSourceObject[entity][ONETOMANYINPUTTYPE] == "1"){
                  let inputNumber = Object.keys(rows[existingRowIndex][entity]).length;
                  rows[existingRowIndex][entity][inputNumber] = {};
                  let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
                  for(let cellRefrence of cellRefrences){
                    if(ws[cellRefrence + rowNum.toString()] !== undefined)
                      rows[index][entity][inputNumber][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] = 
                        ws[cellRefrence + rowNum.toString()].v;
                  }
                }
              }
            }
  
            //No Similar row exist, a new row has to be created
            else {
              for(let entity of entityNames){
                
                
                if(dataSourceObject[entity][RELATION] == RelationWithParent.None || 
                  dataSourceObject[entity[RELATION]] == RelationWithParent.OnetoOne){
                  row[entity] = {};
                  let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
                  // console.log(cellRefrences);
                  for(let cellRefrence of cellRefrences){
                    if(ws[cellRefrence + rowNum.toString()] !== undefined)
                      row[entity][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] = 
                        ws[cellRefrence + rowNum.toString()].v;
                  }
      
                }
      
                else if(dataSourceObject[entity][RELATION] == RelationWithParent.OnetoMany){
                  
                  //If one row many columns
                  if(dataSourceObject[entity][ONETOMANYINPUTTYPE] == "0"){ 
                    row[entity] = []; 
                    let inputNumbers = Object.keys(dataSourceObject[entity][CELLREFRENCES]);
                    for( let inputNumber of inputNumbers){
                      row[entity][inputNumber] = {};
  
                      let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES][inputNumber]);
                      for(let cellRefrence of cellRefrences){
                        if(ws[cellRefrence + rowNum.toString()] !== undefined)
                          row[entity][inputNumber][dataSourceObject[entity][CELLREFRENCES][inputNumber][cellRefrence]] = 
                            ws[cellRefrence + rowNum.toString()].v;
                      }
                    }
                    row[entity] = row[entity].filter( (x) => { console.log(x , Object.keys(x).length); return ((Object.keys(x)).length > 0)});
                    console.log(entity , row[entity]);
                  }
      
                  else {
                    row[entity] = [];
                    row[entity][0] = {};
                    let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
                    // console.log(cellRefrences);
                    for(let cellRefrence of cellRefrences){
                      if(ws[cellRefrence + rowNum.toString()] !== undefined)
                        row[entity][0][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] = 
                        ws[cellRefrence + rowNum.toString()].v;
                    }
                  }
      
                }
              }
              rows.push(row);
              if(str != ''){
                uniqueIdentifierObject[str] = rows.length - 1;
              }
            }
  
            
          }
        }
  
        console.log("rows :: " , rows);
        this.rows = rows;
  
        
        
  
        this.beforeUploadColumnDefinition = this.pageLayoutService.setColumns(
          this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration.ColumnDefinitionList
        );
        this.beforeUploadGridOptions = this.pageLayoutService.setGridOptions(
          this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration
        );  
        
        console.log(this.beforeUploadColumnDefinition , this.beforeUploadGridOptions);
        
        this.uploaded = true;
        this.apiResultReceived = false;
        this.spinner = false;
        this.loadingScreenService.stopLoading();
        
      }
      catch(ex){
        console.log(ex);
        this.alertService.showWarning("Error Occured while parsing excel");
      }
      finally{
        this.loadingScreenService.stopLoading();
        this.spinner = false;
      }
      
    };
    
    reader.readAsBinaryString(this.file);
    
  }

  onClickingSubmitExcelButton(){


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
      confirmButtonText: 'Yes, Save!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.uplaodExcelData(this.rows);
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
       
      }
    })
  }

  columnLetter(col : number):string{
    let intFirstLetter : number = (Math.floor((col) / 676)) + 64;
    let intSecondLetter : number = (Math.floor((col % 676) / 26)) + 64;
    let intThirdLetter : number = (col % 26) + 65;

    let firstLetter : string = (intFirstLetter > 64) ? String.fromCharCode(intFirstLetter) : ' ';
    let secondLetter : string = (intSecondLetter > 64) ? String.fromCharCode(intSecondLetter) : ' ';
    let thirdLetter : string= String.fromCharCode(intThirdLetter);

    return firstLetter.concat(secondLetter).concat(thirdLetter).trim();
  }

  uplaodExcelData(rows:any[]){
    this.apiResultReceived = false;
    this.spinner = true;
    if(this.uploadedImportLayout.SaveExcelDataConfiguration.UseGeneralApi){
      this.importLayoutService.uploadExcelDataWithGeneralApi(rows , this.uploadedImportLayout).subscribe(
        data => {
          this.uploaded = false;
          this.apiResultReceived = true;
          this.file = null;
          this.spinner = false;
          if(this.inputFile != undefined){
            this.inputFile.nativeElement.files = null;
            this.inputFile.nativeElement.value = '';
          }
          console.log(data);
          if(data.Status == true){
            this.alertService.showSuccess(data.Message);
            if(data.Result != null && data.Result != '' && this.uploadedImportLayout.SaveExcelDataConfiguration.DisplayDataGridAfterApiResult){
              console.log("Generating grid");
              this.apiResultColumnDefinition =  this.pageLayoutService.setColumns(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.ColumnDefinitionList);
              this.apiResultGridOptions =  this.pageLayoutService.setGridOptions(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration);
              this.apiResultDataset = JSON.parse(data.Result);
              this.apiResultDataset.forEach(element => {
                if(element.hasOwnProperty('Status')){
                  element["Status"] = element.Status == 0 ? "Failed" : "Success";
                }
              });
            }
          }
          else{
            this.alertService.showWarning(data.Message);
          }
        },
        error => {
          this.spinner = false;
          console.log(error);
          this.alertService.showWarning("Error Occured! Couldn't upload");
        }
      );
    }
    else {
      this.importLayoutService.uploadExcelDataWithCustomApi(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiName , rows , this.uploadedImportLayout.SaveExcelDataConfiguration.ApiRequestType).subscribe(
        data => {
          this.uploaded = false;
          this.apiResultReceived = true;
          this.file = null;
          this.spinner = false;
          if(this.inputFile != undefined){
            this.inputFile.nativeElement.files = null;
            this.inputFile.nativeElement.value = '';
          }
          console.log(data);
          if(data.Status == true){
            
            if(data.Result != null && data.Result != '' && this.uploadedImportLayout.SaveExcelDataConfiguration.DisplayDataGridAfterApiResult){
              this.apiResultColumnDefinition =  this.pageLayoutService.setColumns(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.ColumnDefinitionList);
              this.apiResultGridOptions =  this.pageLayoutService.setGridOptions(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration);
              this.apiResultDataset = JSON.parse(data.Result);
              console.log(this.apiResultColumnDefinition);
              console.log(this.apiResultDataset);
              this.apiResultDataset.forEach(element => {
                if(element.hasOwnProperty('Status')){
                  element["Status"] = element.Status == 0 ? "Failed" : "Success";
                }
              });

            }

            if(this.uploadedImportLayout.SaveExcelDataConfiguration.ShowAlertWarningIfFailed){
              for(let obj of this.apiResultDataset){
                if(obj.Status == false){
                  this.alertService.showWarning(this.uploadedImportLayout.SaveExcelDataConfiguration.WarningMessage);
                  return;
                }
              }
            }
            
            this.alertService.showSuccess("Upload Successfull!");
            
          }
          else{
            this.alertService.showWarning(data.Message);
          }
        },
        error => {
          this.spinner = false;
          console.log(error);
          this.alertService.showWarning("Error Occured! Couldn't upload");
        }
      );
    }
  }

  public base64ToBlob(b64Data, dynoFileName, sliceSize = 512) {
    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(file, dynoFileName + new Date().getTime());
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  onCodeChange(){

    // Should not be required any more
    // if(this.importLayout != null && this.importLayout.CreateExcelConfiguration.SearchConfiguration != null)
    // {
    //   for(let searchElement of this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList){
    //     if(searchElement.GetValueFromUser){
    //       this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList = 
    //         this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList.filter(x => x !== searchElement)
    //     }
    //   }
    // }


    

    if(this.code != null && this.code != ''){
      // this.loadingScreenService.startLoading();
      // this.importLayoutService.getImportLayout(this.code).subscribe( (data) => {
      //   this.loadingScreenService.stopLoading();
      //   if(data.Status && data.dynamicObject != null && data.dynamicObject != ''){
      //     this.importLayout = data.dynamicObject;
      //     console.log(this.importLayout);
      //     this.onImportLayoutChange();

      //   }
      //   else{
      //     this.importLayout = null;
      //     this.alertService.showWarning(data.Message);
      //   }
      // } , error => {
      //   this.loadingScreenService.stopLoading();
      //   console.error(error);
      //   this.alertService.showWarning("Something went wrong! Please Try Again!")
      // })
      
      let importLayout = this.importLayoutList.find( x => x.Code === this.code);
      
      if(importLayout !== undefined && importLayout !== null){
        this.importLayout = _.cloneDeep(importLayout); 
      }
      else{
        this.alertService.showWarning("The given code does not exist");
        this.router.navigate(["app/dashboard"]);
        return;
      }

      //this.importLayout = this.database.find( x => x.Code == 'SalaryTest'); // ! comment it out just for testing 
    }
    else  {
      // this.alertService.showWarning("Please chosse import type to continue");
      this.importLayout = null;
    }

    this.onImportLayoutChange();
      
  }

  onClickingSearchButton($event){
    //console.log(event);
    this.getDataset();
  }

  getDataset(){
    this.dataset = [];
    this.spinner = true;
    this.pageLayoutService.getDataset(this.importLayout.CreateExcelConfiguration.GridConfiguration.DataSource, 
      this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList
      .filter(x => x.SendElementToGridDataSource == true)).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.dataset = JSON.parse(dataset.dynamicObject);
        console.log(dataset);
        console.log(this.dataset);
        // this.dataset.forEach(element => {
        //   element["Status"] = element.Status == 0 ? "In-Active" : "Active";
          
        // });

        
      }
      else {
        // console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })

    this.pageLayoutService.updateFilterCollection(this.columnDefinition , this.importLayout.CreateExcelConfiguration.GridConfiguration.ColumnDefinitionList , this.dataset)
    // this.updateFilter();
  }

  updateFilter(){
    for(let columnDefinition of this.importLayout.CreateExcelConfiguration.GridConfiguration.ColumnDefinitionList){
      const requisiteColumnDef = this.columnDefinition.find((column: Column) => column.id === columnDefinition.Id);

      if (requisiteColumnDef && columnDefinition.IsFilterable && this.dataset != null) {
        // console.log("updating filters");
        
        //Getting distint values from dataset
        const distintCollection : any[] = this.dataset.filter( (notCheckedDataElement , notCheckedIndex , array) => 
          array.findIndex( (checkedDataElement) => 
            notCheckedDataElement[columnDefinition.FieldName] === checkedDataElement[columnDefinition.FieldName] ) === notCheckedIndex 
        );

        requisiteColumnDef.filter = {
          collection : distintCollection,
          customStructure : {
            value : columnDefinition.FieldName,
            label : columnDefinition.FieldName
          },
          model : Filters[columnDefinition.FilterType]
        }
        
      }

    }
  }

  onImportLayoutChange(){

    console.log("Import Layout ::",this.importLayout);

    this.searchElemetsList = [];

    if(this.importLayout != null){
      
      // Set Grids 
      if(this.importLayout.CreateExcelConfiguration.GridConfiguration !== undefined &&
        this.importLayout.CreateExcelConfiguration.GridConfiguration !== null){
          this.columnDefinition = this.pageLayoutService.setColumns(this.importLayout.CreateExcelConfiguration.GridConfiguration.ColumnDefinitionList);
          this.gridOptions = this.pageLayoutService.setGridOptions(this.importLayout.CreateExcelConfiguration.GridConfiguration);
          //console.log(this.importLayout.CreateExcelConfiguration.GridConfiguration , this.gridOptions);
        }
        else{

        }
      
      //Set Search Bar  
      if(this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList !== undefined &&
        this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList !== null &&
        this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList.length > 0){
          this.searchElemetsList = this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList;
          
          if(this.BusinessType !== 3){
            this.pageLayoutService.fillSearchElementsForSME(this.searchElemetsList);
          }

        }
      else{
        this.searchElemetsList = [];
      }

      // for(let controlElement of this.importLayout.ControlElementsList){
      //   if(controlElement.Type == ImportControlElementType.Dynamic){
      //     for(let searchElement of controlElement.SearchElements){
      //       if(searchElement.GetValueFromUser){
      //         this.searchElemetsList.push(searchElement);
      //       }
      //     }
      //   }
      // }

      for(let searchElement of this.searchElemetsList){
        if(searchElement.FieldName == "companyId" || searchElement.FieldName == "@companyId" || 
          searchElement.FieldName == "CompanyId" || searchElement.FieldName == "@CompanyId" ||
          searchElement.FieldName.toUpperCase() == "COMPANYID"|| searchElement.FieldName.toUpperCase() == "@COMPANYID"
          ){
          searchElement.Value = this.companyId;
        }
      }

      if (this.BusinessType != undefined && this.BusinessType != 3) {

        // this.searchElemetsList.length > 0 && this.searchElemetsList.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTID").length > 0 && (this.searchElemetsList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').ParentHasValue.push(true), this.searchElemetsList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTID').Value = this.sessionDetailsService.getSessionStorage("default_SME_ClientId"));
        this.searchElemetsList.length > 0 && 
        this.searchElemetsList.filter(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID").length > 0
         && (
         this.searchElemetsList.find(a => a.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionDetailsService.getSessionStorage("default_SME_ContractId"));
   
      }

      console.log(this.searchElemetsList);
      this.importLayout.CreateExcelConfiguration.SearchConfiguration.SearchElementList = this.searchElemetsList;
    } 
    else{
      this.columnDefinition = null;
      this.gridOptions = null;
    }


    
    
  }  


  onSelectedRowsChanged(eventData, args){
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.dataset);

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('answer', this.selectedItems);
  }

  onbeforeUploadSelectedRowsChanged(eventData, args){
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.beforeUploadDataset);

    this.beforeUploadselectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.beforeUploadDataviewObj.getItem(row);
        this.beforeUploadselectedItems.push(row_data);
      }
    }
    console.log('answer', this.beforeUploadselectedItems);
  }

  onApiResultSelectedRowsChanged(eventData, args){

  }

  angularBeforeUploadGridReady(angularGrid : AngularGridInstance){
    this.beforeUploadAngularGrid = angularGrid;
    this.beforeUploadGridObj = angularGrid.slickGrid; // grid object
    this.beforeUploadDataviewObj = angularGrid.dataView;

    if (this.beforeUploadGridObj && this.beforeUploadGridObj.setOptions) {

      this.beforeUploadGridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }

     
    }
    if (this.uploadedImportLayout.SaveExcelDataConfiguration.BeforeUploadGridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }

  angularApiResultGridReady(angularGrid : AngularGridInstance){
    this.apiResultAngularGrid = angularGrid;
    this.apiResultGridObj = angularGrid.slickGrid; // grid object
    this.apiResultDataviewObj = angularGrid.dataView;

    if (this.apiResultGridObj && this.apiResultGridObj.setOptions) {

      this.apiResultGridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }

     
    }
    if (this.uploadedImportLayout.SaveExcelDataConfiguration.ApiResultGridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }
  

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid; // grid object
    this.dataviewObj = angularGrid.dataView;

    if (this.gridObj && this.gridObj.setOptions) {

      this.gridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.importLayout.CreateExcelConfiguration.GridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.importLayout.CreateExcelConfiguration.GridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }

     
    }
    if (this.importLayout.CreateExcelConfiguration.GridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }
  
  beforeTabChange(event){

  }

}
