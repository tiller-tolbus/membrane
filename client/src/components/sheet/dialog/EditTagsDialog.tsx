import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chips from "../Chips";

interface ChipData {
  key: number;
  label: string;
}
export default function EditTagsDialog({ open, onConfirm, onClose }) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [chipData, setChipData] = React.useState<readonly ChipData[]>([
    { key: 1, label: "tag 1" },
    { key: 2, label: "tag 2" },
    { key: 3, label: "tag 3" },
    { key: 4, label: "tag 4" },
  ]);

  const handleClose = () => {
    onClose();
  };
  const handleTagsUpdate = () => {
    //onConfirm(inputValue);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleDelete = (chipToDelete: ChipData) => {
    console.log("here");
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

  const handleAdd = () => {
    console.log("here");
    const newChipData = [
      ...chipData,
      { key: chipData.length + 1, label: inputValue },
    ];
    setChipData(newChipData);
    setInputValue("");
  };

  const keyHandler = (event) => {
    console.log("here,", event);
    if (event.keyCode === 13) {
      handleAdd();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onClick={(event) => event.stopPropagation()}
      fullWidth
      maxWidth={"sm"}
    >
      <DialogTitle>Update Tags</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter tag name to add</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="enter new tag"
          type="text"
          variant="standard"
          fullWidth
          value={inputValue}
          onChange={handleChange}
          onKeyUp={keyHandler}
        />
        <Chips
          chipData={chipData}
          canDelete={true}
          onDelete={(data) => {
            handleDelete(data);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleTagsUpdate}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}
