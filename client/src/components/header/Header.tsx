import React, { useEffect, useRef, useState } from "react";

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
import OutlinedInput from "@mui/material/OutlinedInput";
import api from "../../api";
import { CELL_CAP } from "../../constants";
const TitleInput = styled(OutlinedInput)(({ theme }) => ({
  ...theme.typography.h6,

  minWidth: 40,
  "& .MuiOutlinedInput-input": {
    padding: 0,
    paddingLeft: 10,
    paddingRight: 10,
  },
}));
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
  displayChildren,
  sheetPath,
  setTitle,
}) {
  const fileInputRef = useRef(null);
  const newTitleSpanRef = useRef(null);
  let navigate = useNavigate();

  const setRows = useStore((store) => store.setRows);
  const setColumns = useStore((store) => store.setColumns);

  const cellCapAlertToggle = useStore((store) => store.cellCapAlertToggle);

  const [editingTitle, setEditingTitle] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [newTitle, setNewTitle] = useState(""); //todo: actual sheetname to begin with
  const [newTitleInputWidth, setNewTitleInputWidth] = useState(0);

  const handleEditTitleChange = (e) => {
    setNewTitle(e.target.value);
  };
  useEffect(() => {
    if (newTitleSpanRef.current) {
      const width = newTitleSpanRef.current.getBoundingClientRect().width;
      setNewTitleInputWidth(width + 20);
    }
  }, [newTitle]);

  useEffect(() => {
    setNewTitle(sheetName);
  }, [sheetName]);
  const handleRename = async () => {
    try {
      //disable input so no more requests can be fired
      setInputDisabled(true);
      const result = await api.renameSheet(sheetPath, newTitle);
      if (result) {
        //request went through, we have a new title
        //update the title in the Sheet component and remove input disabled and hide the input
        setTitle(newTitle);
        setEditingTitle(false);
        setInputDisabled(false);
      } else {
        //something went wrong we want to tell the user(TODO) and keep the input on
        setInputDisabled(false);
      }
    } catch (e) {
      //something went wrong we want to tell the user(TODO) and keep the input on
      setInputDisabled(false);
      console.log("error handleRename => ", e);
    }
    return;
  };
  const keyHandler = (event) => {
    if (event.keyCode === 13) {
      //user entered, update title if any
      if (!newTitle) return;
      handleRename();
    }
  };
  if (!displayChildren) {
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
            navigate("/apps/membrane");
          }}
        >
          go back
        </Button>
      </Stack>
    );
  }

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
          navigate("/apps/membrane");
        }}
      >
        go back
      </Button>
      <Stack direction="row" justifyContent={"space-between"}>
        <Typography
          variant="h6"
          ref={newTitleSpanRef}
          sx={{ visibility: "hidden", position: "absolute", left: -9999 }}
        >
          {newTitle}
        </Typography>
        <Stack direction="row" alignItems="center">
          {editingTitle ? (
            <TitleInput
              sx={{
                width: newTitleInputWidth,
                display: "inline-block",
              }}
              inputProps={{ "aria-label": "search the sheet list" }}
              value={newTitle}
              onChange={handleEditTitleChange}
              onKeyUp={keyHandler}
              disabled={inputDisabled}
              autoFocus
            />
          ) : (
            <Typography
              onDoubleClick={() => {
                setEditingTitle(true);
              }}
              variant="h6"
            >
              {sheetName}
            </Typography>
          )}
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
                  //TODO: this is repeated in Sheet.tsx refractor later
                  const columnLength = arrayData[0].length + 1; // +1 because the first column is the row count one*
                  //directly check if we have too many incoming cells
                  const cellCount = columnLength * arrayData.length;
                  if (cellCount > CELL_CAP) {
                    cellCapAlertToggle(true);
                    return;
                  }
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
