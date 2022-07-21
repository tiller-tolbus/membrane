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
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  verifyCellCount,
} from "../../helpers";
import GridOptions from "./GridOptions";
import useStore from "../../store";
import { MenuOption, SelectionMode } from "@silevis/reactgrid";
import { ExtendedTextCell } from "./ExtendedTextCell";
import CellCapDialog from "./CellCapDialog";

function Grid() {
  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

  const columns = useStore((store) => store.columns);
  const setColumns = useStore((store) => store.setColumns);

  const setSelectedCell = useStore((store) => store.setSelectedCell);

  const cellCapAlertToggle = useStore((store) => store.cellCapAlertToggle);

  const handleColumnResize = (ci: Id, width: number) => {
    const newColumns = reiszeColumns(columns, ci, width);
    setColumns(newColumns);
  };

  const handleChanges = (changes: CellChange<TextCell>[]) => {
    let newRows = rows;
    //TODO: requires more testing
    //perform update x times
    changes.forEach((change) => {
      newRows = updateCell(change, newRows);
    });
    //setting rows directly and updating the rows in store
    if (newRows && newRows.length > 0) setRows(newRows);
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
            //check if we can increment rows by rowCount
            const addedCellsCount = columns.length;
            const canAddMore = verifyCellCount(columns, rows, addedCellsCount);
            //we can't add anymore rows :shrug:
            //TODO: use a modal here
            if (!canAddMore) {
              cellCapAlertToggle(true);
              return;
            }

            const { newRows } = addRow(selectedRowIds[0], "above", rows);
            //update our app's state
            setRows(newRows);
          },
        },
        {
          id: "insertRowBottomMenuItem",
          label: "Insert 1 row below",
          handler: () => {
            //check if we can increment rows by rowCount
            const addedCellsCount = columns.length;
            const canAddMore = verifyCellCount(columns, rows, addedCellsCount);
            //we can't add anymore rows :shrug:
            //TODO: use a modal here
            if (!canAddMore) {
              cellCapAlertToggle(true);
              return;
            }

            const { newRows } = addRow(selectedRowIds[0], "below", rows);
            //update our app's state
            setRows(newRows);
          },
        },
        {
          id: "deleteRowMenuItem",
          label: "Delete row",
          handler: () => {
            const { newRows } = deleteRow(selectedRowIds[0], rows);
            //update our app's state
            setRows(newRows);
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
            //check if we can increment rows by rowCount
            const addedCellsCount = rows.length;
            const canAddMore = verifyCellCount(columns, rows, addedCellsCount);
            //we can't add anymore rows :shrug:
            //TODO: use a modal here
            if (!canAddMore) {
              cellCapAlertToggle(true);
              return;
            }

            const { newColumns, newRows } = addColumn(
              selectedColIds[0],
              "right",
              columns,
              rows
            );
            //update our app's state
            setRows(newRows);
            setColumns(newColumns);
          },
        },
        {
          id: "insertColumnLeftMenuItem",
          label: "Insert 1 column left",
          handler: () => {
            //check if we can increment rows by rowCount
            const addedCellsCount = rows.length;
            const canAddMore = verifyCellCount(columns, rows, addedCellsCount);
            //we can't add anymore rows :shrug:
            //TODO: use a modal here
            if (!canAddMore) {
              cellCapAlertToggle(true);
              return;
            }
            const { newColumns, newRows } = addColumn(
              selectedColIds[0],
              "left",
              columns,
              rows
            );
            //update our app's state
            setRows(newRows);
            setColumns(newColumns);
          },
        },
        {
          id: "deleteColumnMenuItem",
          label: "Delete column",
          handler: () => {
            const { newColumns, newRows } = deleteColumn(
              selectedColIds[0],
              columns,
              rows
            );
            //update our app's state
            setRows(newRows);
            setColumns(newColumns);
          },
        },
      ];
    }

    return menuOptions;
  };
  /**
   * display error state in formulas
   * todo: update selected cell value to display correctly
   */
  return (
    <div>
      <CellCapDialog />
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
          enableRangeSelection
          enableFillHandle
          onContextMenu={handleContextMenu}
          onFocusLocationChanged={(cellLocation) => {
            console.log("cellLocation", cellLocation);
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
        <GridOptions
          addRowsCb={(rowCount: string) => {
            //check if we can increment rows by rowCount
            const canAddMore = verifyCellCount(
              columns,
              rows,
              parseInt(rowCount)
            );
            //we can't add anymore rows :shrug:
            //TODO: use a modal here
            if (!canAddMore) {
              cellCapAlertToggle(true);
              return;
            }

            const newRows = generateRows(parseInt(rowCount), rows);
            setRows(newRows);
          }}
        />
      </div>
    </div>
  );
}
export default memo(Grid);
