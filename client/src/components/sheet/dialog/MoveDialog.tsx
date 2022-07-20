import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { matchURLSafe } from "../../../helpers";
import LoadingButton from "@mui/lab/LoadingButton";

export default function MoveDialog({
  open,
  onConfirm,
  onClose,
  path,
  pathList,
  loading,
}) {
  const [inputValue, setInputValue] = React.useState<string>(path);

  const [pathError, setPathError] = React.useState<boolean>(false);
  const [pathErrorMessage, setPathErrorMessage] = React.useState<string>("");

  const handleClose = () => {
    onClose();
  };
  const handleMove = () => {
    //is the path url-safe?
    const matches = matchURLSafe(inputValue);
    //set error state if need be
    if (!matches) {
      setPathErrorMessage("Make sure the path is correctly formulated");
      setPathError(true);
      return;
    }
    //does the path already exist?
    if (pathList.includes(inputValue)) {
      setPathErrorMessage("This path already exists, try another one");
      setPathError(true);
      return;
    }
    setPathErrorMessage("");
    setPathError(false);
    //TODO: work around, eventually unmount this
    setInputValue("");

    // onConfirm(titleInputValue, pathInputValue);
    onConfirm(inputValue);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  React.useEffect(() => {
    setInputValue(path);
  }, [path]);
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
        <DialogContentText>Current path is {path}</DialogContentText>
        <TextField
          autoFocus
          error={pathError}
          helperText={pathErrorMessage}
          margin="dense"
          id="path"
          label="/path"
          placeholder={"/path"}
          type="text"
          value={inputValue}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton onClick={handleMove} loading={loading}>
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
