import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function DeleteDialog({
  open,
  onClose,
  onConfirm,
  path,
  title,
}) {
  const handleClose = () => {
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      onClick={(event) => event.stopPropagation()}
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle id="alert-dialog-title">
        {"Confirm Deletion of this sheet"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Delete {title} at path: {path}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>cancel</Button>
        <Button onClick={onConfirm}>confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
