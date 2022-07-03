import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CELL_CAP } from "../../constants";
import useStore from "../../store";
import verbiage from "../../verbiage";

export default function CellCapDialog() {
  //this should manage it's own state except the open variable, to avoid rerendring the grid (parent component)
  const cellCapAlertOpen = useStore((store) => store.cellCapAlertOpen);
  const cellCapAlertToggle = useStore((store) => store.cellCapAlertToggle);
  const handleClose = () => {
    cellCapAlertToggle(false);
  };
  return (
    <Dialog
      open={cellCapAlertOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle id="alert-dialog-title">
        {verbiage.cellCapAlertTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {verbiage.cellCapAlertDescription} ({CELL_CAP} cells)
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
}
