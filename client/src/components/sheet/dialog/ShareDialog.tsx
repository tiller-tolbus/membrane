import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
export default function ShareDialog({ open, onConfirm, onClose }) {
  const [inputValue, setInputValue] = React.useState<string>("~");
  const handleClose = () => {
    onClose();
  };
  const handleShare = (event) => {
    event.stopPropagation();
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
      maxWidth={"sm"}
    >
      <DialogTitle>Share with one of your friends</DialogTitle>
      <DialogContent>
        <DialogContentText>enter their @p</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="@p"
          type="text"
          value={inputValue}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleShare}>Share</Button>
      </DialogActions>
    </Dialog>
  );
}
