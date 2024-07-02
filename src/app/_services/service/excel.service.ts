import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
// import { Workbook } from 'exceljs';
import * as Excel  from "exceljs/dist/exceljs.min.js";
declare const ExcelJS: any;


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  // workbook: ExcelJS.Workbook;
  // worksheet: any;
  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet',worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
   
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
  exportExcel_UI(excelData){
    try {
      
   console.log('excel data ::', excelData);
   
      //Title, Header & Data
      const title = excelData.title
      const header =excelData.headers
      const data = excelData.data;
  
      //Create a workbook with a worksheet
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet(title);
  
  
      worksheet.getRow().eachCell({ includeEmpty: true }, function(cell) {
        worksheet.getCell(cell.address).fill = {
          type: 'pattern',
          pattern: 'gray125',
        }
      })
      //Add Row and formatting
      // worksheet.mergeCells('A1', 'C2');
      // let titleRow = worksheet.getCell('A1');
      // titleRow.value = title
      // titleRow.font = {
      //   name: 'Calibri',
      //   size: 16,
      //   underline: 'single',
      //   bold: true,
      //   color: { argb: '0085A3' }
      // }
      // titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
  
      // //Blank Row 
      // worksheet.addRow([]);
  
      //Adding Header Row
      
      let headerRow = worksheet.addRow(header);
      
      headerRow.eachCell((cell, number) => {
       
        cell.font = {
          bold: true,
          color: { argb: '000000' },
          size: 10
        }
      })
  
      // Adding Data with Conditional Formatting
      data.forEach(d => {
        let row = worksheet.addRow(d);
        // let punchin = row.getCell(6);
        // let punchout = row.getCell(9);
        // let color = 'FF99FF99';
        // if (+punchin.value < 200000) {
        //   color = 'FF9999'
        // }
  
        // punchin.fill = {
        //   type: 'pattern',
        //   pattern: 'solid',
        //   fgColor: { argb: color }
        // }
        // punchout.fill = {
        //   type: 'pattern',
        //   pattern: 'solid',
        //   fgColor: { argb: color }
        // }
       
      }
      );
      // worksheet.getColumn(1).width = 15;
      // worksheet.getColumn(2).width = 20;
      // worksheet.getColumn(3).width = 20;
      // worksheet.getColumn(4).width = 15;
      // worksheet.getColumn(7).width = 25;
      // worksheet.getColumn(10).width = 25;
  
      // worksheet.addRow([]);
  
      //Generate & Save Excel File
      console.log('worksheet',worksheet);
      console.log('workbook',workbook);
  
      
      try {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          FileSaver.saveAs(blob, title + '.xlsx');
        })
      } catch (error) {
        console.log('Excel Expection Worksheet:', error);
      }
     
  
    } catch (error) {
        console.log('Excel Expection :', error);
        
    }
  }
  
  exportExcel(excelData) {

    try {
      
   
    //Title, Header & Data
    const title = excelData.title
    const header =excelData.headers
    const data = excelData.data;
console.log('Excel',Excel);

    //Create a workbook with a worksheet
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet('Attendance Data');


    //Add Row and formatting
    worksheet.mergeCells('A1', 'C2');
    let titleRow = worksheet.getCell('A1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Date
    // worksheet.mergeCells('G1:H4');
    // let d = new Date();
    // let date = d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear();
    // let dateCell = worksheet.getCell('G1');
    // dateCell.value = date;
    // dateCell.font = {
    //   name: 'Calibri',
    //   size: 12,
    //   bold: true
    // }
    // dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

  
    //Blank Row 
    worksheet.addRow([]);

    //Adding Header Row
    
    let headerRow = worksheet.addRow(header);
    
    headerRow.eachCell((cell, number) => {
      // cell.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: '4167B8' },
      //   bgColor: { argb: '' }
      // }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 10
      }
    })

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
      let punchin = row.getCell(7);
      let punchout = row.getCell(10);
      let color = 'FF99FF99';
      if (+punchin.value < 200000) {
        color = 'FF9999'
      }

      punchin.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
      punchout.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
     
    }
    );
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(10).width = 25;

    worksheet.addRow([]);

    //Footer Row
    // let footerRow = worksheet.addRow(['Employee Sales Report Generated from example.com at ' + date]);
    // footerRow.getCell(1).fill = {
    //   type: 'pattern',
    //   pattern: 'solid',
    //   fgColor: { argb: 'FFB050' }
    // };

    //Merge Cells
    // worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

    //Generate & Save Excel File
    console.log('worksheet',worksheet);
    console.log('workbook',workbook);

    
    try {
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, title + '.xlsx');
      })
    } catch (error) {
      console.log('Excel Expection Worksheet:', error);
    }
   

  } catch (error) {
      console.log('Excel Expection :', error);
      
  }
  }

  exportToExcel(array_Sheet, filename) {

   
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet(array_Sheet[0].sheet_title);
    let worksheet_2 = workbook.addWorksheet(array_Sheet[1].sheet_title);

    worksheet.mergeCells('C1', 'F1');
    worksheet.getCell('C1').value = array_Sheet[0].sheet_title;
    worksheet_2.mergeCells('C1', 'F1');
    worksheet_2.getCell('C1').value = array_Sheet[1].sheet_title;

    worksheet.addRow(Object.keys(array_Sheet[0].sheet_data[0]));
    worksheet_2.addRow(Object.keys(array_Sheet[1].sheet_data[0]));

    array_Sheet[0].sheet_data.forEach((d: any) => {
      worksheet.addRow(Object.values(d));
    });

    worksheet.getRow(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '58f359' },
    };

    array_Sheet[1].sheet_data.forEach((d: any) => {
      worksheet_2.addRow(Object.values(d));
    });

    worksheet_2.getRow(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2bdfdf' },
    };

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, filename + '.xlsx');
    });
  }

  exportToExcelFromTable(tableElement: any, fileName: any) {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      tableElement.nativeElement
    );

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save the file */
    XLSX.writeFile(wb, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

}