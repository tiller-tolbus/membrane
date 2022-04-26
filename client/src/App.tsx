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

import jsonSpec from "./spec2.json";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import api from "./api";

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
  return initalColumns.map((text, index) => {
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
const dataToJson = (data) => {
  //take the displayed data(rows) and transform it into what the back-end expects
  //returns json
  const specData = data.map((item, index) => {
    return item.cells.map((item) => {
      return item.text;
    });
  });

  return JSON.stringify(specData);
};
const jsonToData = (json) => {
  //take parsed json and turn it into something client can use
  //returns rows and columns

  //these are our columns
  const columns = json[0].map((text, index) => {
    return { columnId: index, columnName: text };
  });
  //these are our rows (includes columns) (final data passed to react grid)
  const rows = json.map((row, index) => {
    //first entry here is the column
    if (index === 0) {
      return {
        rowId: "header",
        cells: row.map((col) => {
          return { type: "header", text: col };
        }),
      };
    }
    return {
      rowId: index,
      cells: row.map((item) => {
        return { type: "text", text: item };
      }),
    };
  });

  return { rows, columns };
};

function App() {
  /*URBIT STUFF HERE */
  // By default, we aren't connected. We need to verify
  const [connected, setConnected] = useState<boolean>(false);
  //create urbit api instance (should consider using setUrbit on retry)
  const urbit = api.init();
  console.log("urbit", urbit);
  const getData = async () => {
    //tries to get data from cell and we check connectivity
    try {
      const data = await api.getSpreadsheetData(urbit);
      console.log("data", data);
      if (data) {
        setConnected(true);
      }
    } catch (e) {
      console.log("something went wrong");
    }
  };

  /* REACT GRID STUFF HERE */
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
    getData();
  }, []);

  if (!connected) {
    return <div className="App">Unconnected</div>;
  }

  return (
    <main>
      <Stack marginY={"1em"} direction="row" justifyContent={"space-between"}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4">Cell</Typography>
          <Typography variant="h5">a spreadsheet app for urbit</Typography>
        </Stack>
        <Button
          variant="contained"
          onClick={() => {
            setRows((oldRows) => generateRows(ROW_COUNT, oldRows));
          }}
        >
          Sync with urbit
        </Button>
      </Stack>
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
          onClick={() => {
            setRows((oldRows) => generateRows(ROW_COUNT, oldRows));
          }}
        >
          Add
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            api.poke({
              app: "cell",
              mark: "push",
              json: "test",
              onSuccess: () => console.log("hoon"),
              onError: () => console.log("doom"),
            });
          }}
        >
          Poke
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
    </main>
  );
}

export default App;
