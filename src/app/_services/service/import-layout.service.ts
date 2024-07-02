import { Injectable } from '@angular/core';
import { ImportLayout, ImportTreeNode } from 'src/app/views/generic-import/import-models';
import { HttpService } from './http.service';
import { appSettings } from '../model';
import { SearchElement } from 'src/app/views/personalised-display/models';
import { ApiRequestType } from 'src/app/views/generic-import/import-enums';
import * as XLSX from 'xlsx';
import { RelationWithParent } from 'src/app/views/generic-form/enums';
import { Observable } from 'rxjs';

type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class ImportLayoutService {

  importLayout: ImportLayout;
  node: ImportTreeNode;
  ColumnNamesObject: {};

  constructor(private http: HttpService) { }

  getImportLayout(code: string) {
    let param = `code=${code}`
    return this.http.get(appSettings.GETIMPORTLAYOUT + param);
  }

  postImportLayout(importLayout: ImportLayout) {
    return this.http.post(appSettings.POSTIMPORTLAYOUT, importLayout);
  }

  getExcelTemplate(importLayout: ImportLayout, fillWithData: any[] = null, searchElements: SearchElement[] = null, extraParameters = null) {
    let templateQueryData = {
      ImportLayout: importLayout,
      FillWithData: fillWithData,
      SearchElements: searchElements,
      ExtraParameters: extraParameters
    }
    console.log('EXCEL INPUTS ::', templateQueryData);

    return this.http.post(appSettings.GETEXCELTEMPLATE, templateQueryData);
  }

  convertByteToFile(b64Data, sliceSize = 512): Blob {
    let byteCharacters = b64Data; //data.file there
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
    //const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //FileSaver.saveAs(file, dynoFileName + new Date().getTime());
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  getEntityMappedDataFromExcel(e: any) {
    // let file : File;
    let uploadedImportLayout: ImportLayout;

    // file                      = files.item(0); 
    const RELATION = "Relation";
    const ONETOMANYINPUTTYPE = "OneToManyInputType";
    const MAXIMUMROWSALLOWED = "MaximumRowsAllowed";
    const NOOFCONTROLELEMENTS = "NoOfControlElements";
    const CELLREFRENCES = "CellRefrences";

    const reader = new FileReader();
    let base64File;

    let rows: any[] = [];

    let row = {};
    /* read workbook */
    const bstr: string = e.target.result;
    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    /* grab first sheet */
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    /* save data */
    let data = <AOA>(XLSX.utils.sheet_to_json(ws));

    var range = XLSX.utils.decode_range(ws['!ref']);

    let dataSourceObject = JSON.parse(ws['ZZ1'].v);
    let uniqueIdentifiers = JSON.parse(ws['AAA1'].v);
    uploadedImportLayout = JSON.parse(ws['AAC1'].v);
    console.log("Uploaded Import Layout :: ", uploadedImportLayout);

    //#region Convert to Entity Mapped Data
    let uniqueIdentifierObject = {};

    let entityNames = Object.keys(dataSourceObject);
    let uniquekeys = Object.keys(uniqueIdentifiers);
    let firstEntity: string = null;
    if (uniquekeys.length > 0)
      firstEntity = uniquekeys[0];

    let str: string = '';
    for (let rowNum = range.s.r + 2; rowNum <= range.e.r + 1; rowNum++) {
      row = {};
      row["Id"] = rowNum;
      str = '';

      if (firstEntity != null) {
        for (let column of uniqueIdentifiers[firstEntity]) {
          str += ws[column + rowNum.toString()].v.toString().trim();
        }
      }


      let index = Object.keys(uniqueIdentifierObject).indexOf(str);


      //If similar row already exists
      if (index >= 0) {
        let existingRowIndex: number = uniqueIdentifierObject[str];

        for (let entity of entityNames) {
          if (dataSourceObject[entity][RELATION] == RelationWithParent.OnetoMany && dataSourceObject[entity][ONETOMANYINPUTTYPE] == "1") {
            let inputNumber = Object.keys(rows[existingRowIndex][entity]).length;
            rows[existingRowIndex][entity][inputNumber] = {};
            let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
            for (let cellRefrence of cellRefrences) {
              if (ws[cellRefrence + rowNum.toString()] !== undefined)
                rows[index][entity][inputNumber][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] =
                  ws[cellRefrence + rowNum.toString()].v;
            }
          }
        }
      }

      //No Similar row exist, a new row has to be created
      else {
        for (let entity of entityNames) {


          if (dataSourceObject[entity][RELATION] == RelationWithParent.None ||
            dataSourceObject[entity[RELATION]] == RelationWithParent.OnetoOne) {
            row[entity] = {};
            let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
            for (let cellRefrence of cellRefrences) {
              if (ws[cellRefrence + rowNum.toString()] !== undefined)
                row[entity][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] =
                  ws[cellRefrence + rowNum.toString()].v;
            }

          }

          else if (dataSourceObject[entity][RELATION] == RelationWithParent.OnetoMany) {

            //If one row many columns
            if (dataSourceObject[entity][ONETOMANYINPUTTYPE] == "0") {
              row[entity] = [];
              let inputNumbers = Object.keys(dataSourceObject[entity][CELLREFRENCES]);
              for (let inputNumber of inputNumbers) {
                row[entity][inputNumber] = {};

                let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES][inputNumber]);
                for (let cellRefrence of cellRefrences) {
                  if (ws[cellRefrence + rowNum.toString()] !== undefined)
                    row[entity][inputNumber][dataSourceObject[entity][CELLREFRENCES][inputNumber][cellRefrence]] =
                      ws[cellRefrence + rowNum.toString()].v;
                }
              }
              row[entity] = row[entity].filter((x) => { console.log(x, Object.keys(x).length); return ((Object.keys(x)).length > 0) });
            }

            else {
              row[entity] = [];
              row[entity][0] = {};
              let cellRefrences = Object.keys(dataSourceObject[entity][CELLREFRENCES]["0"]);
              for (let cellRefrence of cellRefrences) {
                if (ws[cellRefrence + rowNum.toString()] !== undefined)
                  row[entity][0][dataSourceObject[entity][CELLREFRENCES]["0"][cellRefrence]] =
                    ws[cellRefrence + rowNum.toString()].v;
              }
            }

          }
        }
        rows.push(row);
        if (str != '') {
          uniqueIdentifierObject[str] = rows.length - 1;
        }
      }


    }
    //#endregion

    console.log("rows :: ", rows);
    return rows;

  }

  getRawDataFromExcel(e: any) {
    // let file : File;
    let uploadedImportLayout: ImportLayout;
    let rows: any[] = [];

    const reader = new FileReader();
    let base64File;

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

    // Data Format : Raw Data
    rows = data;

    console.log("rows :: ", rows);
    return rows;

  }


  uploadExcelDataWithGeneralApi(rowsData: any[], importLayout: ImportLayout) {
    let exportData = {
      RowsData: rowsData,
      ImportLayout: importLayout
    }
    return this.http.post(appSettings.UPLOADEXCELDATA, exportData);
  }

  uploadExcelDataWithCustomApi(apiName: string, rowsData: any[], requestType: ApiRequestType = null) {
    if (requestType == null) {
      requestType = ApiRequestType.post
    }
    let request: string = ApiRequestType[requestType];
    console.log("Request", request);
    return this.http[request](apiName, rowsData);
  }



}
