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
import { updateCell, reiszeColumns, generateRows } from "./helpers";
import GridOptions from "./GridOptions";
import useStore from "../../store";
export default function Grid() {
  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

  const columns = useStore((store) => store.columns);
  const setColumns = useStore((store) => store.setColumns);

  const handleColumnResize = (ci: Id, width: number) => {
    const newColumns = reiszeColumns(columns, ci, width);
    setColumns(newColumns);
  };

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    //setting rows directly and updating the rows
    //todo: little issues arise from not updating rows each time at the price of performence
    updateCell(changes, rows);
  };

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
