import { Column } from "angular-slickgrid";

export declare type Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => string;
