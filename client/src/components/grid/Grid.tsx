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
  const fetchCellValue = (cellName: string): object | false | any => {
    /*
     * Given a celll name
     * (pattern =>  alphabet char followed by a numeric string) (for now)
     * assumes grid is in Alphanumerical order (x and y)
     * it will output the current content of that cell along with it's coordinates in rows (columnId, rowId)
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
      return { value: cellValue.text, columnId: column, rowId: row };
    }
  };
  const isFormula = (value: string): boolean => {
    //todo: do dis
    return true;
  };
  const formulateFormula = (
    cellValue: string,
    columnId: number,
    rowId: number
  ) => {
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

    //before we can actually excute we need to transform the list into [1,2,3,4,5]
    const executableList = valueList.map((item) => item.value);

    //add onChange
    const formulaData = { ...currentFormula[0], valueList };

    //update formula cell withe formula data using row and column id
    let newRows = [...rows];
    newRows[rowId].cells[columnId] = {
      ...newRows[rowId].cells[columnId],
      formulaData,
    };
    //update each param cell to have formulaLocation and update function too trigger on change
    valueList.forEach((item) => {
      let cellRowId = item.rowId;
      let cellColumnId = item.columnId;
      //add on change function that updates the value in formula cells

      newRows[cellRowId].cells[cellColumnId] = {
        ...newRows[cellRowId].cells[cellColumnId],
        formulaLocation: { columnId, rowId },
        updateFormulaFoo(
          updatedValue,
          formulaLocation,
          currentCellLocation,
          rows
        ) {
          /**
           * this runs on cell change
           * this goes to formula cell and updates it depending on the updatedValue
           * todo:clean it up
           * todo: validate input (display error state in formula cell if no logic value can be derived here)
           */
          const formulaColId = formulaLocation.columnId;
          const formulaRowId = formulaLocation.rowId;
          const { columnId, rowId } = currentCellLocation;

          let newFormulaCell = { ...rows[formulaRowId].cells[formulaColId] };
          let newFormulaData = {
            ...rows[formulaRowId].cells[formulaColId].formulaData,
          };

          let newValueList = newFormulaData.valueList.map((item) => {
            //todo: make all the values (ids) numbers not stringed numbers
            if (columnId == item.columnId && rowId == item.rowId) {
              //found the value to update
              return { ...item, value: updatedValue };
            }
            return item;
          });
          newFormulaData.valueList = newValueList;
          //we have change in our param cells, that means update formula cell
          const executableList = newFormulaData.valueList.map(
            (item) => item.value
          );

          //update the value
          newFormulaCell.formulaData = newFormulaData;
          newFormulaCell.text = newFormulaData
            .execute(executableList)
            .toString();
          //update the formula cell with our values
          rows[formulaRowId].cells[formulaColId] = newFormulaCell;
        },
      };
    });
    //update the cell with the new formula data and update the param cells with their data
    setRows(newRows);
    return { ...currentFormula[0], valueList };
  };
  /**
   * compile formulas on load
   * todo: two formulas and more can have a param cell in common
   * display error state in formulas
   */
  return (
    <>
      <div className={"grid-container"}>
        <Button
          onClick={() =>
            console.log(formulateFormula("=SUM(A1,A2,F1,K52,Z41)", 13, 7))
          }
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
