import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import api from "../api";

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
import SheetItem from "../components/sheet"; //todo: change to import from /componnents
import { SearchBar } from "../components";
import Divider from "@mui/material/Divider";
import { structureJson } from "../helpers";
//TODO: remember this needs a scrollbar body {overflow:hidden} ;)
const sammpleData = require("../sample.json");
export default function Home() {
  const [data, setData] = React.useState([]);
  //TODO: fetch data
  const getSheets = async () => {
    try {
      const allPaths = await api.getAllPaths();
      const serverData = sammpleData;
      console.log("serverData => ", serverData);
      console.log("allPaths => ", allPaths);
      //turn into something we can use for now
      const data = structureJson([serverData]);
      console.log("get data success", data);

      setData(data);
    } catch (e) {
      console.log("Home => getSheets() error", e);
    }
  };
  React.useEffect(() => {
    //fetch our sheets (just one for now)
    getSheets();
  }, []);
  let navigate = useNavigate();
  const goToSheet = (data) =>
    navigate("/apps/membrane/sheet", {
      state: {
        data,
      },
    });
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
  const onMove = (path: string) => {
    console.log("path", path);
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
    <>
      <Container sx={{ paddingBottom: 20 }} fixed>
        <Box
          sx={{
            paddingTop: 5,
            position: "sticky",
            backgroundColor: "white",
            top: 0,
            zIndex: 100, //to be over tooltips
          }}
        >
          <SearchBar />
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
          <Divider light />
        </Box>
        <Box sx={{ paddingTop: 1 }}>
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
                  onMove={onMove}
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
    </>
  );
}

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
