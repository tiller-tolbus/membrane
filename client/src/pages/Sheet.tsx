import React, { useEffect, useState } from "react";

import api from "../api";
import { Grid, Header, Alert, Snackie, CellOptions } from "../components";
//mui
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import AlertTitle from "@mui/material/AlertTitle";

import useStore from "../store";
import {
  getColumns,
  getRows,
  jsonToData,
  formulateFormula,
  inCell,
} from "../helpers";
import verbiage from "../verbiage";
import { useLocation } from "react-router-dom";

function CircularIndeterminate() {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress />
      <Typography variant="h6">{verbiage.connecting}</Typography>
    </Stack>
  );
}
function FailedToConnect(getData) {
  return (
    <Stack direction="column" spacing={3} alignItems="center">
      <Alert
        sx={{ width: 500 }}
        severity="error"
        action={
          <Button
            color="inherit"
            onClick={() => {
              getData();
            }}
          >
            {verbiage.tryAgain}
          </Button>
        }
      >
        <AlertTitle>{verbiage.error}</AlertTitle>
        {verbiage.serverConnectError}
      </Alert>
    </Stack>
  );
}

function Sheet() {
  /*URBIT STUFF HERE */
  // By default, we aren't connected. We need to connect
  const [connected, setConnected] = useState({
    trying: false,
    success: false,
    error: false,
  });
  const [synced, setSynced] = useState({
    trying: false,
    success: false,
    error: false,
  });
  const [title, setTitle] = useState<string>("");
  //the data passed when navigating here by click an item in the home list
  let location: any = useLocation();

  const setRows = useStore((store) => store.setRows);
  const setColumns = useStore((store) => store.setColumns);

  //
  const [snackieOpen, setSnackieOpen] = React.useState(false);

  const handleSanckieClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackieOpen(false);
  };

  const getData = async () => {
    /* calls api to get spreadsheet data and sets it  */

    try {
      setConnected({ success: false, trying: true, error: false });

      const data = await api.getSpreadsheetData();

      console.log("get data success");

      //if we have data saved use it, otherwise generate an empty grid

      if (data && data.length > 0) {
        /**
         *columns are independt of row results (need column length to generate names)
         *but has to be rendered around the same time as rows
         **/
        const columnLength = data[0].length + 1; // +1 because the first column is the row count one

        /* do formula stuff before setting rows  */
        const parsedData = jsonToData(data);
        let newRows;
        //go through each cell to eval formula if any
        parsedData.forEach((row, rowIndex) => {
          row.cells.forEach((cell, cellIndex) => {
            let potentiallyNewerRows = formulateFormula(
              cell.text,
              cellIndex,
              rowIndex,
              parsedData
            );
            if (potentiallyNewerRows) newRows = potentiallyNewerRows;
          });
        });
        //we didn't eval a single formula default to the parsed data
        if (!newRows || newRows.length === 0) newRows = parsedData;

        setColumns(getColumns(columnLength));
        setRows(newRows);
      } else {
        //no data could be fetched, intitalise grid with generated data
        setColumns(getColumns());
        setRows(getRows());
      }

      setConnected({ success: true, trying: false, error: false });
    } catch (e) {
      console.log("error getData: ", e);
      setConnected({ success: false, trying: false, error: true });
    }
  };

  const syncSheet = async () => {
    /*
      PUT the new sheets to urbit
      manage the synced object depending on request result and the snackbar (show/hide) 
    */
    try {
      setSynced({ trying: true, success: false, error: false });

      const response = await api.putSpreadSheetData();

      setSynced({ trying: false, success: true, error: false });
      setSnackieOpen(true);

      console.log("syncSheet response: ", response);
    } catch (e) {
      console.log("syncSheet error: ", e);
      setSynced({ trying: false, success: false, error: true });
      setSnackieOpen(true);
    }
  };
  const doSampleData = async () => {
    /* use the sample json spec to generate something that works for us here */
    //the data passed when navigating here
    const state: any = location.state;

    const data = state.data;
    const { columnCount, rowCount } = data.sheetMeta;
    //generate grid of x size
    const rows = getRows(columnCount, rowCount);
    //go ahead and insert the values into this row
    //todo: do formulas here
    let newRows = inCell(data.sheetData, rows);
    //make our columns based on the length
    let newColumns = getColumns(columnCount);
    //update rows and columns state
    setColumns(newColumns);
    setRows(newRows);
    //set the sheet title here
    setTitle(data.title);
    //have to do this, since you need to tell the grid u got a response and so on
    setConnected({ success: true, trying: false, error: false });
  };
  useEffect(() => {
    doSampleData();
  }, []);

  return (
    <main>
      <Snackie
        open={snackieOpen}
        synced={synced}
        handleClose={handleSanckieClose}
        errorRetry={syncSheet}
      />
      <Header
        sheetName={title}
        synced={synced}
        connected={connected}
        syncSheet={syncSheet}
      >
        <CellOptions />
      </Header>
      {connected.trying && CircularIndeterminate()}
      {connected.success && <Grid />}
      {connected.error && FailedToConnect(getData)}
    </main>
  );
}

export default Sheet;
