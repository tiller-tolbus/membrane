import React, { useEffect, useState } from "react";

import api from "./api";
import { Grid } from "./components";
//mui
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
