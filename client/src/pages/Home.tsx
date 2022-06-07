import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import AddIcon from "@mui/icons-material/Add";

import Container from "@mui/material/Container";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import SheetItem from "../components/sheet";
const data = [
  {
    title: "sheet 1",
    lastEdited: "10:58 PM",
    tags: [{ label: "tag 1" }, { label: "tag 4" }],
    id: 1,
  },
  {
    title: "sheet 2",
    lastEdited: "Apr 10, 2022",
    tags: [
      { label: "tag 1" },
      { label: "tag 2" },
      { label: "tag 3" },
      { label: "tag 4" },
      { label: "tag 5" },
    ],
    id: 2,
  },
  {
    title: "sheet 3",
    lastEdited: "Apr 10, 2022",
    tags: [{ label: "tag 1" }],
    id: 3,
  },
  {
    title: "sheet 4",
    lastEdited: "Apr 10, 2022",
    tags: [],
    id: 4,
  },
  {
    title: "sheet 5",
    lastEdited: "Apr 10, 2022",
    tags: [],
    id: 5,
  },
  {
    title: "sheet 6",
    lastEdited: "Apr 10, 2022",
    tags: [{ label: "tag 1" }, { label: "tag 2" }],
    id: 6,
  },
  {
    title: "sheet 7",
    lastEdited: "Apr 10, 2022",
    tags: [{ label: "tag 1" }, { label: "tag 2" }],
    id: 7,
  },
  {
    title: "sheet 8",
    lastEdited: "Apr 10, 2022",
    tags: [{ label: "tag 1" }, { label: "tag 2" }],
    id: 8,
  },
  {
    title: "sheet 9",
    lastEdited: "Apr 10, 2022",
    tags: [{ label: "tag 1" }, { label: "tag 2" }],
    id: 9,
  },
  {
    title: "sheet 10",
    lastEdited: "Apr 10, 2022",
    tags: [{ label: "tag 1" }],
    id: 10,
  },
  {
    title: "sheet 11",
    lastEdited: "Apr 10, 2022",
    tags: [],
    id: 11,
  },
  {
    title: "sheet 12",
    lastEdited: "Apr 10, 2022",
    tags: [],
    id: 12,
  },
  {
    title: "sheet 13",
    lastEdited: "Apr 10, 2022",
    tags: [
      { label: "tag 1" },
      { label: "tag 2" },
      { label: "tag 3" },
      { label: "tag 4" },
    ],
    id: 13,
  },
];
export default function Home() {
  let navigate = useNavigate();
  const goToSheet = () => navigate("/apps/cell/sheet");
  const onRename = (value: string, id: number) => {
    return;
  };
  const onDelete = (id: number) => {
    console.log("onDelete", id);
    return;
  };
  const onAdd = (name: string) => {
    console.log("onAdd name", name);

    return;
  };
  const onShare = (id: number, user: string) => {
    console.log("id", id);
    console.log("sharing is caring => ", user);
    return;
  };
  const [addDialogOpen, setAddDialogOpen] = React.useState<boolean>(false);
  const onAddDialogClose = () => {
    setAddDialogOpen(false);
  };
  const onAddDialogOpen = () => {
    setAddDialogOpen(true);
  };
  const onAddDialogUpdate = (name: string) => {
    onAddDialogClose();
    onAdd(name);
  };
  return (
    <Container sx={{ marginTop: 10 }} fixed>
      <Grid container>
        <Grid item xs={8}>
          <Button
            sx={{ border: "none", color: "black" }}
            endIcon={<AddIcon />}
            onClick={() => onAddDialogOpen()}
          >
            Add a sheet
          </Button>
        </Grid>
        <Grid item xs={2} marginLeft={-1.5}>
          <Button
            sx={{ border: "none", color: "black" }}
            endIcon={<ArrowDropDownIcon />}
            onClick={() => console.log("here")}
          >
            last edited
          </Button>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
      <Box sx={{ marginTop: 2 }}>
        <Stack justifyContent={"center"}>
          {data.map((item, index) => {
            return (
              <SheetItem
                key={index}
                item={item}
                onAdd={onAdd}
                onRename={onRename}
                onDelete={onDelete}
                onShare={onShare}
                goToSheet={goToSheet}
              />
            );
          })}
        </Stack>
      </Box>
      <AddDialog
        open={addDialogOpen}
        onConfirm={onAddDialogUpdate}
        onClose={onAddDialogClose}
      />
    </Container>
  );
}
/*
  open={deletDialogOpen}
        onConfirm={onDeleteDialogUpdate}
        onClose={onDeleteDialogClose} */

function AddDialog({ open, onConfirm, onClose }) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const handleClose = () => {
    onClose();
  };
  const handleAdd = (event) => {
    onConfirm(inputValue);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  return (
    <Dialog fullWidth maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogTitle>Add a new sheet</DialogTitle>
      <DialogContent>
        <DialogContentText>sheet title</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="title"
          type="text"
          variant="standard"
          value={inputValue}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
