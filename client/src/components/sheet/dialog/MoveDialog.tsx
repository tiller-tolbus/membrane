import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function MoveDialog({ open, onConfirm, onClose }) {
  const [inputValue, setInputValue] = React.useState<string>("dir/sheet");
  const handleClose = () => {
    onClose();
  };
  const handleRename = () => {
    onConfirm(inputValue);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onClick={(event) => event.stopPropagation()}
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle>Move</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the path you wish the sheet to be move to
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="path"
          label="path"
          type="text"
          variant="standard"
          value={inputValue}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleRename}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}
