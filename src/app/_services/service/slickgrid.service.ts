import { Injectable } from 'node_modules/@angular/core';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { Column, GridOption, AngularGridInstance, Aggregators, Grouping, GroupTotalFormatters, Formatters } from 'angular-slickgrid';
import { PageLayout } from 'src/app/views/personalised-display/models';


@Injectable({
    providedIn: 'root'
})
export class SlickgridService {

    pageLayout: PageLayout = null;
    columnDefinition: Column[];
    tempColumn: Column;
    columnName: string;

    gridOptions: GridOption;
    draggableGroupingPlugin: any;
    angularGrid: AngularGridInstance;
    gridObj: any;
    dataviewObj: any;
    pagination = {
        pageSizes: [10, 15, 20, 25, 50, 75],
        pageSize: 15,
    };

    dataset: any[];


    constructor(

    ) { }


    set_slickgrid_columndefinition(pageLayout) {

        return new Promise((resolve, reject) => {

            this.pageLayout = pageLayout;
            this.columnDefinition = [];
            for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {

                this.columnName = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].DisplayName;


                this.tempColumn = {
                    id: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id,
                    name: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].DisplayName,
                    field: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName,
                    sortable: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSortable,
                    cssClass: "pointer",
                    filterable: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsFilterable,

                    // params: {
                    //    groupFormatterPrefix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '', 
                    //    groupFormatterSuffix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '' ,
                    // },  
                    grouping: {
                        getter: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName,
                        formatter: (g) => `${Object.keys(g.rows[0]).filter((key) => { return g.rows[0][key] === g.value })[0]}: ${g.value} <span style="color:green">(${g.count} items)</span>`,
                        aggregators: [],
                        aggregateCollapsed: false,
                        collapsed: false
                    }

                }

                if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
                    switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
                        case 'sum': {
                            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.sumTotals;
                            break;
                        }

                        case 'min': {
                            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.minTotals;
                            break;
                        }

                        case 'max': {
                            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.maxTotals;
                            break;
                        }

                        case 'average': {
                            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.avgTotals;
                            break;
                        }
                    }
                }

                if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SummaryRequiredInGrouping) {

                    for (var j = 0; j < this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType.length; ++j) {
                        switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Type) {
                            case 'sum': {
                                //var temp = new Aggregators.Sum(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
                                this.tempColumn.grouping.aggregators.push(new Aggregators.Sum(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
                                break;
                            }

                            case 'min': {
                                //var temp = new Aggregators.Min(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
                                this.tempColumn.grouping.aggregators.push(new Aggregators.Avg(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
                                break;
                            }

                            case 'max': {
                                //var temp = new Aggregators.Max(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
                                this.tempColumn.grouping.aggregators.push(new Aggregators.Max(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
                                break;
                            }

                            case 'average': {
                                //var temp = new Aggregators.Avg(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
                                this.tempColumn.grouping.aggregators.push(new Aggregators.Avg(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
                                break;
                            }

                        }
                    }
                }

                if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
                    this.tempColumn.params = {
                        groupFormatterPrefix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '',
                        groupFormatterSuffix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '',
                    }
                }

                this.columnDefinition.push(this.tempColumn);
            }

            resolve(this.columnDefinition);
        });
    }

    set_slickgrid_gridoptions(dataset) {

        return new Promise((resolve, reject) => {
            this.dataset = dataset;
            this.gridOptions = {

                enableGridMenu: true,
                enableColumnPicker: false,
                enableAutoResize: true,
                enableSorting: true,
                datasetIdPropertyName: "Id",
                enableColumnReorder: true,
                enableFiltering: false,
                showHeaderRow: true,
                enablePagination: false,
                enableAddRow: false,
                leaveSpaceForNewRows: true,
                autoEdit: false,

                alwaysShowVerticalScroll: false,
                enableCellNavigation: true,
                rowSelectionOptions: {
                    // True (Single Selection), False (Multiple Selections)
                    selectActiveRow: true
                  },
                  checkboxSelector: {
                    // remove the unnecessary "Select All" checkbox in header when in single selection mode
                    hideSelectAllCheckbox: true
                  },
                createFooterRow: true,
                showFooterRow: this.pageLayout.GridConfiguration.IsSummaryRequired,
                footerRowHeight: 30,

                createPreHeaderPanel: true,
                showPreHeaderPanel: false,
                preHeaderPanelHeight: 40,
                draggableGrouping: {
                    dropPlaceHolderText: 'Drop a column header here to group by the column',
                    // groupIconCssClass: 'fa fa-outdent',
                    deleteIconCssClass: 'fa fa-times',
                    onGroupChanged: (e, args) => this.onGroupChange(),
                    onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,

                },

                frozenRow: this.pageLayout.GridConfiguration.PinnedRowCount,
                frozenColumn: this.pageLayout.GridConfiguration.PinnedColumnCount,
                frozenBottom: this.pageLayout.GridConfiguration.PinRowFromBottom,

            };

            if (this.pageLayout.GridConfiguration.IsPaginationRequired === true) {
                this.gridOptions.enablePagination = true;
                this.gridOptions.pagination = this.pagination;
                this.gridOptions.showFooterRow = false;
                this.gridOptions.frozenRow = -1;
                this.gridOptions.frozenColumn = -1;
                this.gridOptions.frozenBottom = false;
            }

            if (this.pageLayout.GridConfiguration.PinnedRowCount >= 0) {
                this.gridOptions.showFooterRow = false;
            }

            // if(this.pageLayout.GridConfiguration.DisplayFilterByDefault === false){
            //   this.gridOptions.showHeaderRow = false;
            // }

            if (this.pageLayout.GridConfiguration.IsGroupingEnabled) {
                this.gridOptions.enableDraggableGrouping = true;
                this.gridOptions.showPreHeaderPanel = true;
                this.gridOptions.frozenRow = -1;
                this.gridOptions.frozenColumn = -1;
                this.gridOptions.frozenBottom = false;
            }

            resolve(this.gridOptions)
        });
    }


    onGroupChange() {
        console.log("changed");
        if (!this.pageLayout.GridConfiguration.IsPaginationRequired && this.gridObj)
            this.updateFooter(this.gridObj);
    }


    updateFooter(gridObj) {
        console.log("im in update footer")
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
}
