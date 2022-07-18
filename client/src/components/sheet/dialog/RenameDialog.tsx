import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
export default function RenameDialog({
  open,
  onConfirm,
  onClose,
  title,
  loading,
}) {
  const [inputValue, setInputValue] = React.useState<string>(title);
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
      <DialogTitle>Rename</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter the new title</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          variant="standard"
          value={inputValue}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          disabled={!inputValue}
          onClick={handleRename}
          loading={loading}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
