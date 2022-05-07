import React, { useEffect, useState } from "react";

import api from "./api";
import { Grid } from "./components";
//mui
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useStore from "./store";
import { getColumns, getRows, jsonToData } from "./components/grid/helpers";

function App() {
  /*URBIT STUFF HERE */
  // By default, we aren't connected. We need to connect
  const [connected, setConnected] = useState<boolean>(false);
  const setRows = useStore((store) => store.setRows);
  const setColumns = useStore((store) => store.setColumns);

  const getData = async () => {
    /* calls api to get spreadsheet data and sets it  */

    try {
      const data = await api.getSpreadsheetData();
      //if we have data saved use it, otherwise generate an empty grid
      setColumns(getColumns());

      if (data && data.length > 0) {
        const parsedData = jsonToData(data);
        setRows(parsedData);
      } else {
        setRows(getRows());
      }

      setConnected(true);
    } catch (e) {
      console.log("something went wrong");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (false) {
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
            api.putSpreadSheetData();
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
