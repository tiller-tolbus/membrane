import React, { useRef } from "react";

//mui
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import LoadingButton from "@mui/lab/LoadingButton";
import verbiage from "../../verbiage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import {
  exportRowsCSV,
  jsonToData,
  importCSV,
  getColumns,
} from "../../helpers";
import useStore from "../../store";

const TextButton = styled(ButtonBase)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 14,
  padding: 0,
  marginLeft: 10,
  textTransform: "lowercase",
  fontWeight: 600,
  height: 20,
}));
const Input = styled("input")({
  display: "none",
});

export default function Header({
  children,

  connected,
  synced,
  syncSheet,
  sheetName,
}) {
  const fileInputRef = useRef(null);
  let navigate = useNavigate();

  const setRows = useStore((store) => store.setRows);
  const setColumns = useStore((store) => store.setColumns);

  return (
    <Stack
      sx={{
        position: "sticky",
        top: 0,
        paddingTop: 1,
        paddingBottom: 1,
        paddingRight: 2,
      }}
    >
      <Button
        size={"small"}
        startIcon={<ArrowBackIcon />}
        sx={{ border: "none", color: "black", width: 100 }}
        onClick={() => {
          navigate(-1);
        }}
      >
        go back
      </Button>
      <Stack direction="row" justifyContent={"space-between"}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h6">{sheetName}</Typography>
          <Stack direction="row" marginLeft={1}>
            <label htmlFor="contained-button-file">
              <Input
                ref={fileInputRef}
                accept="csv/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={async (event) => {
                  //get at the file
                  const file = event.target.files[0];
                  //get the text value from the file
                  const textValues = await file.text();
                  //parse the text into arrays of arrays
                  const arrayData = importCSV(textValues);
                  //parse the array of arrays intro
                  //TODO: this is repeated in Sheet.tsx
                  const columnLength = arrayData[0].length + 1; // +1 because the first column is the row count one

                  // do formula stuff before setting rows
                  //TODO: add formulas here?
                  const parsedData = jsonToData(arrayData);

                  setColumns(getColumns(columnLength));
                  setRows(parsedData);

                  //reset input value so it can accapte a file of the same name again
                  event.target.value = "";
                  return true;
                }}
              />
              <TextButton
                onClick={() => {
                  fileInputRef.current && fileInputRef.current.click();
                }}
              >
                Import
              </TextButton>
            </label>
            <TextButton
              onClick={() => {
                exportRowsCSV();
              }}
            >
              Export
            </TextButton>
          </Stack>
        </Stack>

        {connected.success && (
          <LoadingButton
            sx={{ width: 100 }}
            variant="contained"
            loading={synced.trying}
            onClick={() => {
              syncSheet();
            }}
            loadingIndicator="Syncing..."
          >
            {verbiage.sync}
          </LoadingButton>
        )}
      </Stack>
      {children}
    </Stack>
  );
}
