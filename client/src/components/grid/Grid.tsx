import React, { useEffect, useState } from "react";
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  Id,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import "./grid-custom-styles.css";
import { updateCell, getRows, getColumns, generateRows } from "./helpers";
import GridOptions from "./GridOptions";
export default function Grid() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    //setting rows directly and updating the rows
    updateCell(changes, rows);
  };
  useEffect(() => {
    //use the json file to generate our rows and columns
    //simulates and actual api call for now
    //otherwise we can use getRows and getColumns directly
    // const { columns, rows } = jsonToData(jsonSpec)
    //update our state with the values
    setColumns(getColumns());
    setRows(getRows());
  }, []);
  return (
    <>
      <div className={"grid-container"}>
        <ReactGrid
          rows={rows}
          columns={columns}
          onCellsChanged={handleChanges}
          stickyTopRows={1}
          stickyLeftColumns={1}
          onColumnResized={handleColumnResize}
          enableRowSelection
          enableColumnSelection
        />
      </div>
      <GridOptions
        addRowsCb={(rowCount: string) => {
          setRows((oldRows) => generateRows(parseInt(rowCount), oldRows));
        }}
      />
    </>
  );
}
