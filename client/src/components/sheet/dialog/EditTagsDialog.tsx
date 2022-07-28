import * as React from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
import Chips from "../Chips";

interface ChipData {
  key: number;
  label: string;
}
export default function EditTagsDialog({
  open,
  onConfirm,
  onClose,
  tags,
  loading,
}) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [chipData, setChipData] = React.useState<readonly ChipData[]>(tags);

  const handleClose = () => {
    onClose();
  };
  const handleTagsUpdate = () => {
    //transform chipData (key/label array) into tags (array of strings)
    const newTags = chipData.map((item) => item.label);

    onConfirm(newTags);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleDelete = (chipToDelete: ChipData) => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

  const handleAdd = () => {
    //we remove white space around the text
    const label = inputValue.trim();
    //if no text, we abort
    if (label.length === 0) return;
    const newChipData = [...chipData, { key: chipData.length + 1, label }];
    setChipData(newChipData);
    setInputValue("");
  };

  const keyHandler = (event) => {
    if (event.keyCode === 13) {
      handleAdd();
    }
  };
  React.useEffect(() => {
    setChipData(tags);
  }, [tags]);
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
        <LoadingButton onClick={handleTagsUpdate} loading={loading}>
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
