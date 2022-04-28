import React, { useEffect, useState } from "react";

import jsonSpec from "./spec2.json";
import api from "./api";
import { Grid } from "./components";
//mui
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
  // By default, we aren't connected. We need to connect
  const [connected, setConnected] = useState<boolean>(false);
  
  const getData = async () => {
    //tries to get data from cell and we check connectivity
    try {
      const data = await api.getSpreadsheetData();
      console.log("data", data);
      if (data) {
        setConnected(true);
      }
    } catch (e) {
      console.log("something went wrong");
    }
  };

  useEffect(() => {
    //todo: comment this
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
            alert("soon...");
          }}
        >
          Sync with urbit
        </Button>
      </Stack>
      <Grid />
    </main>
  );
}

export default App;
