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
//mui
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import api from "../../api";

const ROW_COUNT = 1000;

const initalColumns = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const getColumns = () => {
  /* this function decides metadata like width and height in columns */
  return initalColumns.map((text, index) => {
    //TODO: make first column smaller
    return { columnId: index, columnName: text, width: 100, resizable: true };
  });
};

const getRows = () => {
  //main app data is returned here
  //make the intial rows, i.e the first row from columns
  const initialRow = [
    {
      rowId: "header",
      cells: initalColumns.map((col) => {
        return { type: "header", text: col };
      }),
    },
  ];
  //generate 1000 new rows
  return generateRows(ROW_COUNT, initialRow);
};

const applyChangesToCell = (changes, prevRows) => {
  //use the changes object to directly access the correct cell and update it using the new text!
  const { rowId, columnId, newCell } = changes[0];
  let newRows = [...prevRows];
  newRows[rowId].cells[columnId].text = newCell.text;
  return newRows;
};

const generateRows = (rowCount, oldRows) => {
  //make a copy of the old rows
  const newRows = [...oldRows];
  //establish the number of columns
  const colCount = newRows[0].cells.length;
  //add x rows (rowCount)
  for (let i = 0; i < rowCount; i++) {
    let cells = [];
    //make the cells using colCount
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      //if it's a first cell, insert the row count else just have an empty string
      let content = colIndex > 0 ? "" : newRows.length.toString();
      cells.push({ type: "text", text: content });
    }
    //insert the id of the new row and insert the row
    newRows.push({
      rowId: newRows.length,
      cells,
    });
  }
  return newRows;
};
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
    //setting rows directly and updating the rows in state with the data (this but this is how the library works)
    setRows((prevRows) => applyChangesToCell(changes, prevRows));
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
      <Stack
        sx={{ marginTop: "1em" }}
        direction="row"
        spacing={2}
        alignItems="center"
      >
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const pokeTestRes = api.pokeTest();
              console.log("pokeTestRes", pokeTestRes);
            } catch (e) {
              console.log("pokeTest error", e);
            }
          }}
        >
          Poke test
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setRows((oldRows) => generateRows(ROW_COUNT, oldRows));
          }}
        >
          Add
        </Button>
        <TextField
          hiddenLabel
          id="outlined-number"
          type="number"
          size="small"
          variant="standard"
          value={"1000"}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <p>more rows</p>
      </Stack>
    </>
  );
}
