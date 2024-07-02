import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
// model class 
import { UserInterfaceControls, _userInterfaceControls } from '../model/UserInterfaceControls';
import { LoginResponses, Role } from '../model/Common/LoginResponses';
import { SessionStorage } from './session-storage.service'; // session storage
import { SessionKeys } from '../configs/app.config'; // app config 
import { PageLayout, ColumnDefinition } from 'src/app/views/personalised-display/models';
import { AngularGridInstance, GridOption, Column } from 'angular-slickgrid';
import { PagelayoutService } from './pagelayout.service';


@Injectable({
    providedIn: 'root'
})

export class PageLayoutBuilderService {
    pageLayout: PageLayout = null;
    tempColumn: Column;
    columnName: string;
    dataset: any;
    columnDefinition: Column[];
    gridOptions: GridOption;
    angularGrid: AngularGridInstance;
    gridObj: any;
    dataviewObj: any;
    draggableGroupingPlugin: any;

    constructor(
        private pageLayoutService: PagelayoutService
    ) { }


    pagelayoutConfiguration(code, behaviousObject) {
        const promise = new Promise((resolve, reject) => {
            this.pageLayoutService.getPageLayout(code).subscribe(response => {
                if (response.Status === true && response.dynamicObject != null) {
                    this.pageLayout = response.dynamicObject;

                    var data = behaviousObject;
                    if (data.DataInterface.SearchElementValuesList !== null && data.DataInterface.SearchElementValuesList.length > 0) {
                        data.DataInterface.SearchElementValuesList.forEach(searchElementValues => {
                            this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
                                if (searchElementValues.OutputFieldName === searchElement.FieldName) {
                                    searchElement.Value = searchElementValues.Value;
                                    searchElement.ReadOnly = searchElementValues.ReadOnly;
                                }
                            })
                        })
                    }
                    else if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
                    }

                    resolve(this.pageLayout)
                }

            }, error => {
                console.log(error);
            }
            );
        })

        return promise;
    }



    async updateFooter(gridObj, pageLayout) {
        this.pageLayout = pageLayout;
        console.log("im in update footer")
        const promise2 = new Promise((resolve, reject) => {
            for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
                if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
                    var value;
                    switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
                        case 'sum': {
                            value = this.getSum(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            columnElement.innerHTML = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix + value.toString() + this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix;
                            break;
                        }

                        case 'min': {
                            value = this.getMin(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');
                            break;
                        }

                        case 'max': {
                            value = this.getMax(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');

                            break;
                        }

                        case 'average': {
                            value = this.getAverage(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
                            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');
                            break;
                        }

                    }
                }
            }

            resolve(this.pageLayout)
        })
        return promise2;

    }

    getSum(fieldName: string) {
        var sum = 0;
        for (var i = 0; i < this.dataset.length; ++i) {
            var num: number = this.dataset[i][fieldName];
            sum += num;
        }
        return sum;
    }

    getMin(fieldName: string) {
        var min = Number.MAX_SAFE_INTEGER;
        for (var i = 0; i < this.dataset.length; ++i) {
            var num: number = this.dataset[i][fieldName];
            min = Math.min(num, min);
        }
        return min;

    }

    getMax(fieldName: string) {
        var max = Number.MIN_SAFE_INTEGER;
        for (var i = 0; i < this.dataset.length; ++i) {
            var num: number = this.dataset[i][fieldName];
            max = Math.max(num, max);
        }
        return max;
    }

    getAverage(fieldName: string) {
        var sum = this.getSum(fieldName);
        var avg = sum / this.dataset.length;
        return avg;
    }

    mockData(count: number) {
        const mockDatadet = [];

        for (let i = 0; i < count; ++i) {
            const randomCode = Math.floor(Math.random() * 1000);

            mockDatadet[i] = {
                Id: i,
                Code: randomCode,
                Name: 'Banglore',
                StatusCode: 'Active'
            };
        }

        return mockDatadet;
    }

    executeFunction(columnDefinition: ColumnDefinition, rowData: any, column: any) {
        switch (columnDefinition.FunctionName) {

        }
    }
}