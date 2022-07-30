import React, { useState, useEffect } from "react";
import useStore from "../../store";
import Paper from "@mui/material/Paper";

import Stack from "@mui/material/Stack";
import { Divider } from "@mui/material";

import IconButton from "@mui/material/IconButton";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { updateCell, unHookFormula } from "../../helpers";

import { ColorPopover } from "../index";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";

import { MultiSelect } from "../index";
import { styled } from "@mui/material/styles";

import ButtonBase from "@mui/material/ButtonBase";

import cloneDeep from "lodash/cloneDeep";

const TextButton = styled(ButtonBase)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 14,
  padding: 0,
  marginLeft: 10,
  textTransform: "lowercase",
  fontWeight: 600,
}));
interface CellMetaData {
  cellName: string;
  cellText: string;
  isBold: boolean;
  isItalic: boolean;
  isFormula: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
}
//TODO: this component is throwing a controlled component warning....
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
      isUnderline: false,
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
      let isUnderline = false;
      let textColor = "";
      let backgroundColor = "";
      let fontSize;

      cellName = selectedCell.name;
      isBold = !!cellData.customStyles?.bold;
      isItalic = !!cellData.customStyles?.italic;
      isStrikethrough = !!cellData.customStyles?.strikethrough;
      isUnderline = !!cellData.customStyles?.underline;
      textColor = cellData.customStyles?.color;
      backgroundColor = cellData.customStyles?.backgroundColor;
      fontSize = cellData.customStyles?.fontSize
        ? cellData.customStyles?.fontSize
        : 14;

      if (cellData.formulaData) {
        isFormula = true;
      }
      cellText = cellData.input;

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
        isUnderline,
      };
      setSelectedCellMetaData(newCellMetaData);
      //default value for our input
      setCellValueInput(cellText);
    }
  }, [selectedCell]);
  const updateCellStyles = (selectedCell, styleUpdate) => {
    //TODO: comment this function
    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;

    let newRows = cloneDeep(rows);
    let currentCell = newRows[rowId].cells[columnId];
    let newCustomStyle = { ...currentCell.customStyles };

    newCustomStyle = {
      ...newCustomStyle,
      [styleUpdate[0]]: styleUpdate[1],
    };

    currentCell.customStyles = newCustomStyle;

    if (columnId === 0) {
      newRows[rowId].cells = newRows[rowId].cells.map((item) => {
        return {
          ...item,
          customStyles: {
            ...item.customStyles,
            [styleUpdate[0]]: styleUpdate[1],
          },
        };
      });
    } else if (rowId === 0) {
      newRows.forEach((row) => {
        row.cells[columnId] = {
          ...row.cells[columnId],
          customStyles: {
            ...row.cells[columnId].customStyles,
            [styleUpdate[0]]: styleUpdate[1],
          },
        };
      });
    }
    setRows(newRows);
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const makeCellBold = () => {
    updateCellStyles(selectedCell, ["bold", !isBold]);
  };
  const makeCellItalic = () => {
    updateCellStyles(selectedCell, ["italic", !isItalic]);
  };
  const setCellTextColor = (color: "") => {
    updateCellStyles(selectedCell, ["color", color]);
  };
  const setCellBackgroundColor = (color: "") => {
    updateCellStyles(selectedCell, ["backgroundColor", color]);
  };

  const makeCellStrikethrough = () => {
    updateCellStyles(selectedCell, ["strikethrough", !isStrikethrough]);
  };
  const makeCellUnderline = () => {
    updateCellStyles(selectedCell, ["underline", !isUnderline]);
  };
  const setCellFontSize = (fontSize: "") => {
    updateCellStyles(selectedCell, ["fontSize", parseInt(fontSize)]);
  };

  const clearStyles = () => {
    //TODO: comment this function

    if (!selectedCell) return false;
    const { columnId, rowId } = selectedCell.location;
    //make a copy of rows
    let newRows = cloneDeep(rows);
    let currentCell = newRows[rowId].cells[columnId];

    delete currentCell.customStyles;
    if (columnId === 0) {
      newRows[rowId].cells = newRows[rowId].cells.map((item) => {
        const newCell = item;
        delete newCell.customStyles;
        return newCell;
      });
    } else if (rowId === 0) {
      newRows.forEach((row) => {
        delete row.cells[columnId]?.customStyles;
      });
    }
    setRows(newRows);
    setSelectedCell({ ...selectedCell, cellData: currentCell });
  };
  const keyHandler = (event) => {
    //if a user pressed enter in the cell value input
    if (event.keyCode === 13) {
      updateCellValue();
    }
  };
  const updateCellValue = () => {
    /**
     * updates cell value
     **/
    const { columnId, rowId } = selectedCell.location;
    //get the location
    //update the text here before calling updateCell
    const newCell = {
      ...selectedCell.cellData,
      text: cellValueInput,
    };

    const updateCellData = {
      columnId,
      rowId,
      newCell,
      previousCell: selectedCell.cellData,
    };

    //pass the data so the changes can be made, and commit to state
    setRows(updateCell(updateCellData, rows));

    return;
  };
  //todo: on keydown, remove focus from input to tell the user a change has been affected
  const {
    isBold,
    isItalic,
    cellName,
    isStrikethrough,
    backgroundColor,
    textColor,
    fontSize,
    isUnderline,
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
            size="small"
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="make cell italic"
            onClick={() => makeCellItalic()}
            color={isItalic ? "primary" : "default"}
            disabled={!selectedCell?.cellData}
            size="small"
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="make cell strikethrough"
            onClick={() => makeCellStrikethrough()}
            color={isStrikethrough ? "primary" : "default"}
            disabled={!selectedCell?.cellData}
            size="small"
          >
            <StrikethroughSIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="make cell underline"
            onClick={() => makeCellUnderline()}
            color={isUnderline ? "primary" : "default"}
            disabled={!selectedCell?.cellData}
            size="small"
          >
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Stack flexDirection="row" alignItems="center">
          <ColorPopover
            updateCell={setCellTextColor}
            icon={<FormatColorTextIcon fontSize="small" />}
            passedId={"text-color-popover"}
            disabled={!selectedCell?.cellData}
            selectedColorIcon={textColor}
          />
          <ColorPopover
            updateCell={setCellBackgroundColor}
            icon={<FormatColorFillIcon fontSize="small" />}
            passedId={"background-color-popover"}
            disabled={!selectedCell?.cellData}
            selectedColorIcon={backgroundColor}
          />
        </Stack>
        <TextButton disabled={!selectedCell?.cellData} onClick={clearStyles}>
          clear style
        </TextButton>
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
            //disable if row cell or column cell
            sx={{ ml: 1, flex: 1 }}
            value={cellValueInput}
            onChange={(e) => {
              setCellValueInput(e.target.value);
            }}
            inputProps={{ "aria-label": "update the currently selected cell" }}
            onKeyDown={keyHandler}
            disabled={
              !selectedCell?.cellData ||
              selectedCell?.location?.rowId === 0 ||
              selectedCell?.location?.columnId === 0
            }
          />
        </Stack>
      </Paper>
    </div>
  );
}
