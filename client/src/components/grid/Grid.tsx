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
import useStore from "../../store";
export default function Grid() {
  const [columns, setColumns] = useState([]);
  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

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
    //todo: little issues arise from not updating rows each time at the price of performence
    updateCell(changes, rows);
  };
  useEffect(() => {
    //todo: make sure this runs before setRows, otherwise issues with rendering the grid arise
    setColumns(getColumns());
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
          const newRows = generateRows(parseInt(rowCount), rows);
          setRows(newRows);
        }}
      />
    </>
  );
}
