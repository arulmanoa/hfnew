// import { Column, Formatter } from "angular-slickgrid";
import { Column } from "angular-slickgrid";
import moment from "moment";
import { Formatter } from "./Formatter";
import { IGridFormatters } from "./IGridFormatters";


export class GridFormatters  implements IGridFormatters{
    public ExcelNumberToDate : Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value != null && value >= 0 ? moment( ( value - 25569 ) * 24 * 60 * 60 * 1000).format('DD-MM-YYYY') : "0" ;

    public previewFormatter : Formatter= (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value ? `<i class="mdi mdi-eye m-r-xs" title="Preview" style="cursor:pointer"></i> ` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';

}