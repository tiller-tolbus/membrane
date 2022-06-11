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
import {
  updateCell,
  reiszeColumns,
  generateRows,
  toString26,
} from "../../helpers";
import GridOptions from "./GridOptions";
import useStore from "../../store";
import { Button } from "@mui/material";
import availableFormulas from "./formulajs";
import { MenuOption, SelectionMode } from "@silevis/reactgrid";

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
     *
     * todo: return false if the cell can't be found or if no columnName, row.....
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
  const isFormula = (value: string): boolean | [] => {
    //returns false if no formula found
    //returns formula object when we detect a formula
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
      return false;
    }
    //get at the formula
    const foundFormula = cellValue.slice(
      cellValue.indexOf("=") + 1,
      cellValue.indexOf("(")
    );
    //no formula bye bye
    if (!foundFormula) return false;
    //formula function not found in our availableFormulas list, nothing to evaluate
    //todo: add feedback in above case
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
   * before settings rows go through every
   * todo: two formulas and more can have a param cell in common
   * display error state in formulas
   */
  const handleContextMenu = (
    selectedRowIds: number[],
    selectedColIds: number[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[]
  ): MenuOption[] => {
    /* our menu that appears on right click */
    if (selectionMode === "row") {
      menuOptions = [
        ...menuOptions,
        {
          id: "insertRowTopMenuItem",
          label: "Insert 1 row above",
          handler: () => {
            addRow(selectedRowIds[0], "above");
          },
        },
        {
          id: "insertRowBottomMenuItem",
          label: "Insert 1 row below",
          handler: () => {
            addRow(selectedRowIds[0], "below");
          },
        },
      ];
    }
    if (selectionMode === "column") {
      //exclude the first column from having these extra options
      if (selectedColIds[0] === 0) return menuOptions;
      menuOptions = [
        ...menuOptions,
        {
          id: "insertColumnRightMenuItem",
          label: "Insert 1 column right",
          handler: () => {
            addColumn(selectedColIds[0], "right");
          },
        },
        {
          id: "insertColumnLeftMenuItem",
          label: "Insert 1 column left",
          handler: () => {
            addColumn(selectedColIds[0], "left");
          },
        },
      ];
    }

    return menuOptions;
  };
  const arrayInsertItemAtIndex = (index, item, array) => {
    array.splice(index, 0, item);
  };
  const addColumn = (selectedColumnId: number, direction: "left" | "right") => {
    /**
     * given a columnId and direction
     * insert a whole column
     * i.e add a cell in each row at the given columnId
     * offset either to the left or right
     * updates state (rows and columns)
     **/

    //make a copy of current rows
    let newRows = [...rows];
    let newColumns = [...columns];
    //cell index is offset by direction from columnId
    let cellIndex =
      direction === "left" ? selectedColumnId : selectedColumnId + 1;

    //update our columns here
    //split into two arrays, before and after cellIndex
    //todo: interact with a copy of columns.... not columns itself
    let newColumnsBefore = newColumns.slice(0, cellIndex);
    let newColumnsAfter = newColumns.slice(cellIndex);
    //add our new column in the before array
    newColumnsBefore.push({
      //todo: make a function that spits out this data in our helper
      columnId: newColumnsBefore.length,
      //todo: use base26string on this and on the rest of the columnNames
      columnName: toString26(newColumnsBefore.length).toUpperCase(),
      width: 100,
      resizable: true,
    });
    //adjust the after array's indecies
    let startIndex = newColumnsBefore.length;
    newColumnsAfter = newColumnsAfter.map((item, index) => {
      return {
        ...item,
        columnId: startIndex + index,
        columnName: toString26(startIndex + index).toUpperCase(),
      };
    });
    //merge the two parts
    const finalColumns = [...newColumnsBefore, ...newColumnsAfter];
    //update our rows here
    newRows.forEach((item, index) => {
      let newCell;
      if (index === 0) {
        //header cells
        //use the generated columns above here
        //update the title of the first row (columns)
        let newCells = finalColumns.map((item) => {
          console.log("item", item);
          return { type: "header", text: item.columnName };
        });
        newRows[0].cells = newCells;
      } else {
        //regular cells
        //add a new empty cell in this row at the index we have
        newCell = { type: "text", text: "" };
        //insert newCells at the current index
        arrayInsertItemAtIndex(cellIndex, newCell, item.cells);
      }
    });

    //update our app's state
    setRows(newRows);
    setColumns(finalColumns);
  };
  const addRow = (selectedRowId: number, direction: "above" | "below") => {
    /**
     * given a row id and direction
     * insert a whole row
     * offset either to be above or below currently selected row
     * updates state (rows )
     **/
    //make a copy of current rows
    let newRows = [...rows];
    //cell index is offset by direction from columnId
    let rowIndex = direction === "above" ? selectedRowId : selectedRowId + 1;
    //split into tow arrays, before rowIndex and afterRowIndex
    //split into two arrays, before and after cellIndex
    let newRowsBefore = newRows.slice(0, rowIndex);
    let newRowsAfter = newRows.slice(rowIndex);

    //add our new row in the before array

    newRowsBefore.push({
      rowId: newRowsBefore.length,
      //only really using this for the length value
      cells: newRowsBefore[0].cells.map((item, index) => {
        if (index === 0) {
          return {
            type: "text",
            text: newRowsBefore.length.toString(),
            nonEditable: true,
          };
        }
        return { type: "text", text: "" };
      }),
    });
    let startIndex = newRowsBefore.length;

    //increment the row ids and the first cell  text(count cell ) of each of these rows
    newRowsAfter = newRowsAfter.map((item, index) => {
      let newCells = [...item.cells];
      newCells[0].text = (startIndex + index).toString();
      return {
        rowId: startIndex + index,
        cells: newCells,
      };
    });
    //merge the two arrays
    let finalRows = [...newRowsBefore, ...newRowsAfter];
    //update rows state
    setRows(finalRows);
  };

  return (
    <div>
      {/*  <Button
        onClick={() =>
          console.log(formulateFormula("=SUM(A1,A2,F1,K741,Z41)", 13, 7))
        }
      >
        sds
      </Button>*/}
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
          onContextMenu={handleContextMenu}
        />
      </div>
      <GridOptions
        addRowsCb={(rowCount: string) => {
          const newRows = generateRows(parseInt(rowCount), rows);
          setRows(newRows);
        }}
      />
    </div>
  );
}
export default memo(Grid);
