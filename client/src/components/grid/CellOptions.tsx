import React, { useState, useEffect } from "react";
import useStore from "../../store";
import Paper from "@mui/material/Paper";

import Stack from "@mui/material/Stack";
import { Divider } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { updateCell, unHookFormula } from "../../helpers";

import { ColorPopover } from "../index";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";

import { MultiSelect } from "../index";
interface CellMetaData {
  cellName: string;
  cellText: string;
  isBold: boolean;
  isItalic: boolean;
  isFormula: boolean;
  isStrikethrough: boolean;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
}
//this component is seperate to avoid rerendirng the whole grid each time focus goes somewhere else
export default function CellOptions() {
  const [cellValueInput, setCellValueInput] = useState<string>("");
  const [selectedCellMetaData, setSelectedCellMetaData] =
    useState<CellMetaData>({
      cellName: "",
      cellText: "",
      isBold: false,
      isItalic: false,
      isFormula: false,
      isStrikethrough: false,
      textColor: "",
      backgroundColor: "",
      fontSize: 14,
    });
  const rows = useStore((store) => store.rows);
  const setRows = useStore((store) => store.setRows);

  const selectedCell = useStore((store) => store.selectedCell);
  const setSelectedCell = useStore((store) => store.setSelectedCell);

  useEffect(() => {
    if (selectedCell?.cellData) {
      const cellData = selectedCell.cellData;
      //if we have formula, display it's non evaled text, else just display the text
      let cellText = "";
      let isBold = false;
      let isItalic = false;
      let cellName = "";
      let isFormula = false;
      let isStrikethrough = false;
      let textColor = "";
      let backgroundColor = "";
      let fontSize;

      cellName = selectedCell.name;
      isBold = !!cellData.customStyles?.bold;
      isItalic = !!cellData.customStyles?.italic;
      isStrikethrough = !!cellData.customStyles?.strikethrough;
      textColor = cellData.customStyles?.color;
      backgroundColor = cellData.customStyles?.backgroundColor;
      fontSize = cellData.customStyles?.fontSize
        ? cellData.customStyles?.fontSize
        : 14;

      if (cellData.formulaData && cellData.formulaData.nonEvaledText) {
        isFormula = true;
        cellText = cellData.formulaData.nonEvaledText;
      } else {
        cellText = cellData.text;
      }

      const newCellMetaData = {
        cellText,
        isBold,
        isItalic,
        cellName,
        isFormula,
        isStrikethrough,
        textColor,
        backgroundColor,
        fontSize,
      };
      setSelectedCellMetaData(newCellMetaData);
      //default value for our input
      setCellValueInput(cellText);
    }
  }, [selectedCell]);

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
  const setCellTextColor = (color: "") => {
    //TODO: what's a good default value here?
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = { ...currentCell.customStyles, color: color };

    currentCell.customStyles = newCustomStyle;
    //update rows to affect changes
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const setCellBackgroundColor = (color: "") => {
    //TODO: what's a good default value here?
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = {
      ...currentCell.customStyles,
      backgroundColor: color,
    };

    currentCell.customStyles = newCustomStyle;
    //update rows to affect changes
    setRows(newRows);
    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const updateCellValue = () => {
    /**
     * updates cell value and updates formula if need be
     **/
    const { columnId, rowId } = selectedCell.location;
    //get the location
    //update the text here before calling updateCell
    const newCell = { ...selectedCell.cellData, text: cellValueInput };
    const updateCellData = { columnId, rowId, newCell };

    if (selectedCellMetaData.isFormula) {
      //we have a new formula
      //unhook all the deps of the previous formula
      let newRows = unHookFormula(
        selectedCell.cellData.formulaData,
        columnId,
        rowId,
        rows
      );
      //pass the data so the changes can be made (handles the new value wether it's a new formula or just a plain text)
      //commit to state
      setRows(updateCell([updateCellData], newRows));
    } else {
      //pass the data so the changes can be made, and commit to state
      setRows(updateCell([updateCellData], rows));
    }
    return;
  };
  const makeCellStrikethrough = () => {
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = { ...currentCell.customStyles };
    if (isStrikethrough) {
      //if this evaluates to true, it's already strikethrough, so remove the strikethrough value from customStyles
      delete newCustomStyle.strikethrough;
    } else {
      //is not already strikethrough, set strikethrough to true
      newCustomStyle = { ...newCustomStyle, strikethrough: true };
    }
    //commit changes
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
  const keyHandler = (event) => {
    //if a user pressed enter in the cell value input
    if (event.keyCode === 13) {
      updateCellValue();
    }
  };
  const setCellFontSize = (fontSize: "") => {
    //TODO: what's a good default value here?
    if (!selectedCell) return false;

    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = [...rows];
    //update the select cell with the new styles
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = {
      ...currentCell.customStyles,
      fontSize: parseInt(fontSize),
    };
    currentCell.customStyles = newCustomStyle;
    //update rows to affect changes
    setRows(newRows);

    //we also need to change the selectedCell, sincec we just changed it
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  //todo: user can edit this cell here
  //todo: make sticky(style this in general)
  //todo: refractor these functions
  //todo: on keydown, remove focus from input to tell the user a change has been affected
  const {
    isBold,
    isItalic,
    cellName,
    isStrikethrough,
    backgroundColor,
    textColor,
    fontSize,
  } = selectedCellMetaData;
  return (
    <div>
      <Stack flexDirection="row">
        <MultiSelect
          onSelection={(value) => setCellFontSize(value)}
          defaultValue={fontSize}
          options={[
            { value: 8 },
            { value: 10 },
            { value: 12 },
            { value: 14 },
            { value: 16 },
            { value: 18 },
            { value: 24 },
          ]}
          disabled={!selectedCell?.cellData}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "fit-content",
            //border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton
            aria-label="make cell bold"
            onClick={() => makeCellBold()}
            color={isBold ? "primary" : "default"}
            disabled={!selectedCell?.cellData}
          >
            <FormatBoldIcon />
          </IconButton>
          <IconButton
            aria-label="make cell italic"
            onClick={() => makeCellItalic()}
            color={isItalic ? "primary" : "default"}
            disabled={!selectedCell?.cellData}
          >
            <FormatItalicIcon />
          </IconButton>
          <IconButton
            aria-label="make cell strikethrough"
            onClick={() => makeCellStrikethrough()}
            color={isStrikethrough ? "primary" : "default"}
            disabled={!selectedCell?.cellData}
          >
            <StrikethroughSIcon />
          </IconButton>
        </Box>
        <Stack flexDirection="row" alignItems="center">
          <ColorPopover
            updateCell={setCellTextColor}
            icon={<FormatColorTextIcon />}
            passedId={"text-color-popover"}
            disabled={!selectedCell?.cellData}
            selectedColorIcon={textColor}
          />
          <ColorPopover
            updateCell={setCellBackgroundColor}
            icon={<FormatColorFillIcon />}
            passedId={"background-color-popover"}
            disabled={!selectedCell?.cellData}
            selectedColorIcon={backgroundColor}
          />
        </Stack>
        <Button
          disabled={!selectedCell?.cellData}
          variant="text"
          size="small"
          onClick={clearStyles}
        >
          clear style
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
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            value={cellValueInput}
            onChange={(e) => {
              setCellValueInput(e.target.value);
            }}
            inputProps={{ "aria-label": "update the currently selected cell" }}
            onKeyDown={keyHandler}
          />
        </Stack>
      </Paper>
    </div>
  );
}