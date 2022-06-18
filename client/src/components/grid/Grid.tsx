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
import CellOptions from "./CellOptions";
import { ExtendedTextCell } from "./ExtendedTextCell";
import cloneDeep from "lodash/cloneDeep";
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
        {
          id: "deleteRowMenuItem",
          label: "Delete row",
          handler: () => {
            deleteRow(selectedRowIds[0]);
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
        {
          id: "deleteColumnMenuItem",
          label: "Delete column",
          handler: () => {
            deleteColumn(selectedColIds[0]);
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
     * i.e add a cell in each row at the given columnId(cells[x])
     * offset either to the left or right
     * updates state (rows and columns)
     **/

    //make a copy of current rows and columns
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
  const deleteColumn = (selectedColumnId: number) => {
    /**
     * Given columnId, delete a whole column
     * i.e delete from each row the cell at selectedColumnId (cells[x])
     * updates row and column state
     * todo: in the future should just return new rows/columns
     *  */
    //make a copy of current rows and columns
    let newRows = cloneDeep(rows);
    let newColumns = cloneDeep(columns);

    //update our columns here
    //split into two arrays, before and after cellIndex
    let newColumnsBefore = newColumns.slice(0, selectedColumnId);
    let newColumnsAfter = newColumns.slice(selectedColumnId);
    //the column to remove is here in the front of the after array, shift it
    console.log(newColumnsAfter.shift());
    //adjust the after array's indecies and names
    let startIndex = selectedColumnId;
    newColumnsAfter = newColumnsAfter.map((item, index) => {
      return {
        ...item,
        columnId: startIndex + index,
        columnName: toString26(startIndex + index).toUpperCase(),
      };
    });
    //merge the two parts
    const finalColumns = [...newColumnsBefore, ...newColumnsAfter];
    //update our rows, deleteing the cells that need to be
    const finalRows = newRows.map((item, index) => {
      if (index === 0) {
        //header cells
        //use the generated columns above here
        //update the title of the first row (columns)
        let newCells = finalColumns.map((item) => {
          return { type: "header", text: item.columnName };
        });
        return { ...item, cells: newCells };
      } else {
        //regular cells
        let newCells = cloneDeep(item.cells);
        //remove the cell we want to get rid of
        newCells.splice(selectedColumnId, 1);
        return { ...item, cells: newCells };
      }
    });
    //update rows and columns in state
    setColumns(finalColumns);
    setRows(finalRows);
    return;
  };
  const deleteRow = (selectedRowId: number) => {
    /**
     * Given rowId, delete a whole row
     * i.e delete a whole entry from rows array, offseting the count
     * updates rows state
     * todo: in the future should just return new rows
     *  */

    //split into tow arrays, before rowIndex and afterRowIndex
    //split into two arrays, before and after cellIndex
    let newRows = cloneDeep(rows);
    let newRowsBefore = newRows.slice(0, selectedRowId);
    let newRowsAfter = newRows.slice(selectedRowId);

    //the row we want to delete is in the after array (at 0 index), we shift it off
    newRowsAfter.shift();

    let startIndex = selectedRowId;

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
    setRows(finalRows);
  };
  /**
   * -important: start using deep copy https://lodash.com/docs/4.17.15#cloneDeep
   * display error state in formulas
   * todo: update formulas on deleting rows/columns since the deletion can probably affect the param cells/formula cells
   * todo: update selected cell value to display correctly
   */
  return (
    <div>
      <CellOptions />

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
          onFocusLocationChanged={(cellLocation) => {
            const { columnId, rowId } = cellLocation;
            const cellData = rows[rowId]?.cells[columnId];
            if (cellData) {
              //make the cell name
              let name = (toString26(columnId) + rowId)?.toUpperCase();
              setSelectedCell({
                cellData: { ...cellData },
                location: { columnId, rowId },
                name,
              });
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
