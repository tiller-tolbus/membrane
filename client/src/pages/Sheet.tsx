import React, { useEffect, useState } from "react";

import api from "../api";
import { Grid, Header, Alert, Snackie, CellOptions } from "../components";
//mui
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AlertTitle from "@mui/material/AlertTitle";
import cloneDeep from "lodash/cloneDeep";

import useStore from "../store";
import {
  getColumns,
  getRows,
  formulateFormula,
  inCell,
  structureJson,
  metaArrayToStyleArray,
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
      <Typography variant="h6">Loading Sheet...</Typography>
    </Stack>
  );
}
function FailedToFetchData(getData) {
  return (
    <Stack direction="column" spacing={3} alignItems="center" height={200}>
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
        Failed to load this sheet
      </Alert>
    </Stack>
  );
}

function Sheet() {
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
  const [path, setPath] = useState<string>("");
  const [fetchedSheetData, setFetchedSheetData] = useState(null); //sheet data as we recieve it from the server, unedited

  let location = useLocation();
  const setRows = useStore((store) => store.setRows);
  const setColumns = useStore((store) => store.setColumns);

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

  const syncSheet = async () => {
    /*
      PUT the sheet to urbit (saving changes)
    */

    try {
      setSynced({ trying: true, success: false, error: false });
      const uneditedSheetMeta = fetchedSheetData.meta;
      const response = await api.putSpreadSheetData(uneditedSheetMeta);

      setSynced({ trying: false, success: true, error: false });
      setSnackieOpen(true);

      console.log("syncSheet response: ", response);
    } catch (e) {
      console.log("syncSheet error: ", e);
      setSynced({ trying: false, success: false, error: true });
      setSnackieOpen(true);
    }
  };
  const getData = async () => {
    /**
     * Fetch sheet data based on the passed path
     * managing inputs(formulas) and outputs and columns
     */
    setConnected({ success: false, trying: true, error: false });
    //TODO: can we do better? probably, just use the whole url up to membrane/sheet to split by
    const path = location.pathname.split("/apps/membrane/sheet")[1];
    try {
      const sheetData = await api.getSheetByPath(path);
      setFetchedSheetData(sheetData);

      const data = structureJson(sheetData);

      const { columnCount, rowCount, columnMeta, rowMeta } = data.sheetMeta;
      //make the meta arrays useable
      const columnStyles = metaArrayToStyleArray(columnMeta);
      const rowStyles = metaArrayToStyleArray(rowMeta);

      //generate grid of x size
      const rows = getRows(columnCount, rowCount, columnStyles, rowStyles);
      //go ahead and insert the values into the rows (also column/row styles)
      let newRows = inCell(data.sheetData, rows);
      //make our columns based on the length
      let newColumns = getColumns(columnCount, columnStyles);
      //go through each cell to eval formula if any
      let newRowsFormulas = newRows;

      newRows.forEach((row, rowIndex) => {
        row.cells.forEach((cell, cellIndex) => {
          let potentiallyNewerRows = formulateFormula(
            cell.text,
            cellIndex,
            rowIndex,
            newRowsFormulas
          );
          if (potentiallyNewerRows) newRowsFormulas = potentiallyNewerRows;
        });
      });
      //we didn't eval a single formula default to the regular data
      if (!newRowsFormulas || newRowsFormulas.length === 0)
        newRowsFormulas = newRows;
      //update rows and columns state
      setColumns(newColumns);
      setRows(newRowsFormulas);
      //set the sheet title here
      setTitle(data.title);
      setPath(data.path);
      //have to do this, since you need to tell the grid u got a response and so on
      setConnected({ success: true, trying: false, error: false });
    } catch (e) {
      setConnected({ success: false, trying: false, error: true });
    }
  };
  useEffect(() => {
    getData();
    //hide body scrollbar for the sheet
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "scroll";
    };
  }, []);

  return (
    <main>
      <Snackie
        open={snackieOpen}
        state={synced}
        handleClose={handleSanckieClose}
        errorRetry={syncSheet}
        successText={verbiage.syncSuccess}
        errorText={verbiage.syncFail}
      />
      <Header
        sheetName={title}
        setTitle={(newTitle) => {
          //update title in state and update it in the fetchedSheetData(we use the meta obj here to sync later)
          const newFetchedSheetData = cloneDeep(fetchedSheetData);
          newFetchedSheetData.meta.title = newTitle;

          setFetchedSheetData(newFetchedSheetData);
          setTitle(newTitle);
        }}
        sheetPath={path}
        synced={synced}
        connected={connected}
        syncSheet={syncSheet}
        displayChildren={connected.success}
      >
        <CellOptions />
      </Header>

      {connected.success && <Grid />}

      {connected.trying && CircularIndeterminate()}
      {connected.error && FailedToFetchData(getData)}
    </main>
  );
}

export default Sheet;
