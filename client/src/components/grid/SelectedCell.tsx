import React from "react";
import useStore from "../../store";
import Paper from "@mui/material/Paper";

import Stack from "@mui/material/Stack";
import { Divider } from "@mui/material";
//this component is seperate to avoid rerendirng the whole grid each time focus goes somewhere else
export default function SelectedCell() {
  const selectedCell = useStore((store) => store.selectedCell);
  //if we have formula, display it's non evaled text, else just display the text
  let text;
  if (selectedCell.formulaData && selectedCell.formulaData.nonEvaledText) {
    text = selectedCell.formulaData.nonEvaledText;
  } else {
    text = selectedCell.text;
  }
  //todo: user can edit this cell here
  //todo: add the name of the currently selected cell (A1....)
  //todo: make sticky
  return (
    <Paper variant="outlined">
      <Stack
        flexDirection={"row"}
        alignItems="center"
        height={25}
        paddingLeft={1}
      >
        <p style={{ color: "grey" }}>Fx</p>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ paddingLeft: 1, paddingRight: 1 }}
        />
        <p style={{ marginLeft: 0.5 }}>{text}</p>
      </Stack>
    </Paper>
  );
}
