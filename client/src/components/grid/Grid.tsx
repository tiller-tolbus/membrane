import React, { memo } from "react";

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
import { updateCell, reiszeColumns, generateRows } from "../../helpers";
import GridOptions from "./GridOptions";
import useStore from "../../store";
import { Button } from "@mui/material";
import availableFormulas from "./formulajs";
function Grid() {
  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

  const columns = useStore((store) => store.columns);
  const setColumns = useStore((store) => store.setColumns);

  const handleColumnResize = (ci: Id, width: number) => {
    const newColumns = reiszeColumns(columns, ci, width);
    setColumns(newColumns);
  };

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    //setting rows directly and updating the rows in store
    //todo: little issues arise from not updating rows each time at the price of performence

    setRows(updateCell(changes, rows));
  };
  const fetchCellValue = (cellName: string): string | false => {
    /*
     * Given a celll name
     * (pattern =>  alphabet char followed by a numeric string) (for now)
     * assumes grid is in Alphanumerical order (x and y)
     * it will output the current content of that cell
     * todo: should also eventually do arrays
     * and eventually cells should have identifiers for easy of use and to give the user freedom to rename their cells...
     */

    //no cellName nothing to do
    if (!cellName) return false;

    //split string into alphabet / numeral
    let splitName = cellName.match(/[a-zA-Z]+|[0-9]+/g);
    let columnName = splitName[0];
    let row = splitName[1];


    let column;
    //find column in the header list, and the index will be the position in row
    rows[0].cells.forEach((cell: any, index: number) => {
      if (cell.text === columnName) {
        //found our column here, save the index
        column = index;
      }
    });
    //if we have both row and column value, try to access the cell, and return it's content (text)
    if (row !== null && column !== null) {
      let cellValue = rows[row].cells[column];
      return cellValue.text;
    }
  };
  const formulateFormula = (cellValue: string) => {
    /**
     * todo: comment better
     * check to find our avlbl forumla between "=" and the first "("
     */
    if (!cellValue) return false;
    //if our cellValue starts with "=" than we have a formula on our hands
    if (cellValue[0] !== "=") {
      return;
    }
    //get at the formula
    const foundFormula = cellValue.slice(
      cellValue.indexOf("=") + 1,
      cellValue.indexOf("(")
    );
    //no formula bye bye
    if (!foundFormula) return false;
    //formula doesn't not found in our formulas list bye bye
    const currentFormula = availableFormulas.filter(
      (formula) => formula.name === foundFormula
    );
    if (currentFormula && currentFormula.length === 0) return false;
    //get all our params here
    //our params are in between "(" ")", seprated by ","
    const betweenBrackets = cellValue.slice(
      cellValue.indexOf("(") + 1,
      cellValue.indexOf(")")
    );
    const paramList = betweenBrackets.split(",");
    //convert paramsInto values we can pass to our Formula
    //todo: handle if one of the value is false (ie no value could be fetched for that cell reference)
    //todo: remove space around characeters? help user out
    const valueList = paramList.map((item) => fetchCellValue(item));

    console.log("currentFormula", currentFormula);
    console.log("betweenBrackets", betweenBrackets);
    console.log("paramList", paramList);
    console.log("valueList", valueList);

    console.log("fooo", currentFormula[0].execute(valueList));
  };
  return (
    <>
      <div className={"grid-container"}>
        <Button
          onClick={() => console.log(formulateFormula("=SUM(A1,A2,F1,K52,Z41)"))}
        >
          sds
        </Button>
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
export default memo(Grid);
