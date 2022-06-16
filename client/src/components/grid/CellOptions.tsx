import React, { useState } from "react";
import useStore from "../../store";
import Paper from "@mui/material/Paper";

import Stack from "@mui/material/Stack";
import { Divider } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import Box from "@mui/material/Box";

//this component is seperate to avoid rerendirng the whole grid each time focus goes somewhere else
export default function CellOptions() {
  const [textColor, setTextColor] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");

  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

  const selectedCell = useStore((store) => store.selectedCell);
  const setSelectedCell = useStore((store) => store.setSelectedCell);

  //if we have formula, display it's non evaled text, else just display the text
  let text;
  let isBold;
  let isItalic;
  let cellName;
  const cellData = selectedCell.cellData;
  if (cellData) {
    cellName = selectedCell.name;
    isBold = !!cellData.customStyles?.bold;
    isItalic = !!cellData.customStyles?.italic;
    if (cellData.formulaData && cellData.formulaData.nonEvaledText) {
      text = cellData.formulaData.nonEvaledText;
    } else {
      text = cellData.text;
    }
  }

  const makeCellBold = () => {
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = { ...currentCell.customStyles };
    if (isBold) {
      //if this evaluates to true, it's already bold, so remove the italic value from customStyles
      delete newCustomStyle.bold;
    } else {
      //is not already bold, set italic to true
      newCustomStyle = { ...newCustomStyle, bold: true };
    }
    //commit changes to rows
    currentCell.customStyles = newCustomStyle;
    //update rows in state to affect changes to our app
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const makeCellItalic = () => {
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = { ...currentCell.customStyles };
    if (isItalic) {
      //if this evaluates to true, it's already italic, so remove the italic value from customStyles
      delete newCustomStyle.italic;
    } else {
      //is not already italic, set italic to true
      newCustomStyle = { ...newCustomStyle, italic: true };
    }
    //commit changes
    currentCell.customStyles = newCustomStyle;
    //update rows to affect changes
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const setCellTextColor = () => {
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = { ...currentCell.customStyles, color: textColor };

    currentCell.customStyles = newCustomStyle;
    //update rows to affect changes
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const setCellBackgroundColor = () => {
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = {
      ...currentCell.customStyles,
      backgroundColor: backgroundColor,
    };

    currentCell.customStyles = newCustomStyle;
    //update rows to affect changes
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const clearStyles = () => {
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    //if we have wdon't have a customStyles object, nothing to do return false
    if (!currentCell.customStyles) return false;
    //otherwise delete it and proceed
    delete currentCell.customStyles;

    //update rows to affect changes
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  //todo: user can edit this cell here
  //todo: add the name of the currently selected cell (A1....)
  //todo: make sticky(style this in general)
  //todo: refractor these functions
  //todo: if no styles; disable remove styles button
  return (
    <>
      <Stack flexDirection="row">
        <Stack flexDirection="row">
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              console.log("e.target.value", e.target.value);
              setTextColor(e.target.value);
            }}
          />
          <Button
            disabled={!textColor}
            variant="text"
            size="small"
            onClick={setCellTextColor}
          >
            set as text color
          </Button>
        </Stack>
        <Stack flexDirection="row">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => {
              console.log("e.target.value", e.target.value);
              setBackgroundColor(e.target.value);
            }}
          />
          <Button
            disabled={!backgroundColor}
            variant="text"
            size="small"
            onClick={setCellBackgroundColor}
          >
            set as backgroundColor
          </Button>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "fit-content",
            // border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton
            aria-label="make cell bold"
            onClick={() => makeCellBold()}
            color={isBold ? "primary" : "default"}
          >
            <FormatBoldIcon />
          </IconButton>
          <IconButton
            aria-label="make cell italic"
            onClick={() => makeCellItalic()}
            color={isItalic ? "primary" : "default"}
          >
            <FormatItalicIcon />
          </IconButton>
        </Box>
        <Button variant="text" size="small" onClick={clearStyles}>
          clear all styles
        </Button>
      </Stack>
      <Paper variant="outlined">
        <Stack
          flexDirection={"row"}
          alignItems="center"
          height={25}
          paddingLeft={1}
        >
          {cellName && <p style={{ color: "grey" }}>{cellName}</p>}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ paddingLeft: 1, paddingRight: 1 }}
          />
          <p style={{ color: "grey" }}>Fx</p>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ paddingLeft: 1, paddingRight: 1 }}
          />
          <p style={{ marginLeft: 0.5 }}>{text}</p>
        </Stack>
      </Paper>
    </>
  );
}
