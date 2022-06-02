import React, { useEffect, useState } from "react";
import "./App.css";
import { useInterval } from "usehooks-ts";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

const baseURL = "http://localhost:8080/";
const columnsURL = baseURL + "columns";
const valuesURL = baseURL + "values";

function cleanseColumnName(raw: string) {
  return raw.replace(/[^a-zA-Z]/g, "");
}

function App() {
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [orderedColumnNames, setOrderedColumnNames] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    fetch(columnsURL)
      .then((response) => response.json())
      .then((data) => {
        const defs = data.map((column: any) => {
          const { name, type } = column;
          return { field: cleanseColumnName(name), headerName: name };
        });
        setColumnDefs(defs);

        setOrderedColumnNames(
          data.map((column: any) => cleanseColumnName(column.name))
        );
      });
  }, []);

  useEffect(() => {
    fetch(valuesURL)
      .then((response) => response.json())
      .then((data) => {
        const rd = data.map((row: { values: string[] }) => {
          const rowObject = {};
          orderedColumnNames.forEach((key, index) => {
            // @ts-ignore
            rowObject[key] = row.values[index];
          });

          return rowObject;
        });
        setRowData(rd);
      });
  }, [tick]);

  useInterval(() => {
    setTick(tick + 1);
  }, 1000);

  return (
    <div className="App">
      <div>{columnDefs.length}</div>
      <div>{rowData.length}</div>
      <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} />
      </div>
    </div>
  );
}

export default App;
