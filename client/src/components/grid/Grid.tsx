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
import { MenuOption, SelectionMode } from "@silevis/reactgrid";
import SelectedCell from "./SelectedCell";
import { ExtendedTextCell } from "./ExtendedTextCell";

function Grid() {
  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

  const columns = useStore((store) => store.columns);
  const setColumns = useStore((store) => store.setColumns);

  const setSelectedCell = useStore((store) => store.setSelectedCell);

  const handleColumnResize = (ci: Id, width: number) => {
    const newColumns = reiszeColumns(columns, ci, width);
    setColumns(newColumns);
  };

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    //setting rows directly and updating the rows in store
    //todo: little issues arise from not updating rows each time at the price of performence
    setRows(updateCell(changes, rows));
  };

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
  /**
   * todo: two formulas and more can have a param cell in common
   * display error state in formulas
   * show formula value
   * user can edit formulas, find a way to unhook and rehook...
   * show selected cell name (A1)
   */
  return (
    <div>
      <div className={"grid-container"}>
        <SelectedCell />
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
          onFocusLocationChanged={(cellLocation) => {
            const { columnId, rowId } = cellLocation;
            const cellData = rows[rowId]?.cells[columnId];
            if (cellData) {
              setSelectedCell(cellData);
            }
          }}
          customCellTemplates={{ extendedText: new ExtendedTextCell() }}
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
