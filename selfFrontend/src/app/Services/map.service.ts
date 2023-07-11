import { Injectable, OnInit } from '@angular/core';
import * as saveAs from 'file-saver';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor() {}

  onDownload(DataArray: any) {
    console.log(DataArray.length);
    if (DataArray.length == 0) return;

    const stringifiedArray = DataArray.map((item: any) => {
      for (const key in item) {
        if (typeof item[key] === 'object') {
          item[key] = JSON.stringify(item[key]);
        }
      }
      return item;
    });

    const csv = Papa.unparse(stringifiedArray);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'tableData.csv');
  }
}
