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
import {
  updateCell,
  getRows,
  getColumns,
  generateRows,
  dataToJson,
} from "./helpers";

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
    setRows((prevRows) => updateCell(changes, prevRows));
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
              console.log(dataToJson(rows));
              const pokeTestRes = await api.pokeTest();
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
            setRows((oldRows) => generateRows(1500, oldRows));
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
