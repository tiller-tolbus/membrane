import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";

const ob = require("urbit-ob");
export default function ShareDialog({ open, onConfirm, onClose, pals }) {
  const [inputValue, setInputValue] = React.useState<string>("~");

  const [pathError, setPathError] = React.useState<boolean>(false);
  const [pathErrorMessage, setPathErrorMessage] = React.useState<string>("");

  const handleClose = () => {
    onClose();
  };
  const handleShare = () => {
    try {
      const isValid = ob.isValidPatp(inputValue);
      /*if (isValid) {
        //TODO: eventually restrict moons?
        const clan = ob.clan(inputValue);
        console.log("clan", clan);
      }*/
      if (!isValid) {
        setPathErrorMessage("Make sure the ship you entered exists");
        setPathError(true);
        return;
      }
      setPathErrorMessage("");
      setPathError(false);
      //it's valid, go ahead and try to share this
    } catch (e) {
      console.log("e", e);
    }

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
      fullWidth
    >
      <DialogTitle>Share</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the ship name you wish to send this sheet to
        </DialogContentText>
        <Autocomplete
          freeSolo
          id="pals-autocomplete"
          disableClearable
          options={pals}
          value={inputValue}
          onChange={(event, value) => {
            //we handle this a little different from a standard input
            setInputValue(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              spellCheck="false"
              error={pathError}
              helperText={pathErrorMessage}
              margin="dense"
              id="name"
              label="@p"
              type="text"
              value={inputValue}
              onChange={handleChange}
              autoFocus
              fullWidth
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button disabled={!inputValue} onClick={handleShare}>
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
}
