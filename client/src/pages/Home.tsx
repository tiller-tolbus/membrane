import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import api from "../api";

import AddIcon from "@mui/icons-material/Add";

import Container from "@mui/material/Container";

import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useNavigate } from "react-router-dom";
import SheetItem from "../components/sheet"; //todo: change to import from /componnents
import { SearchBar, Alert } from "../components";
import Divider from "@mui/material/Divider";
import { structureJson1, structureJson, matchURLSafe } from "../helpers";
//TODO: remember this needs a scrollbar body {overflow:hidden} ;)
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import verbiage from "../verbiage";
import AlertTitle from "@mui/material/AlertTitle";
import cloneDeep from "lodash/cloneDeep";

function CircularIndeterminate() {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      marginTop={8}
    >
      <CircularProgress />
      <Typography variant="h6">Loading Sheets...</Typography>
    </Stack>
  );
}
function FailedToConnect(getData) {
  return (
    <Stack direction="column" spacing={3} alignItems="center" marginTop={5}>
      <Alert
        sx={{ width: 500 }}
        severity="error"
        action={
          <Button
            color="inherit"
            onClick={() => {
              getData();
            }}
          >
            {verbiage.tryAgain}
          </Button>
        }
      >
        <AlertTitle>{verbiage.error}</AlertTitle>
        Failed to get your sheets
      </Alert>
    </Stack>
  );
}
export default function Home() {
  const [sheetList, setSheetList] = React.useState([]); //list of sheets
  //TODO:update the way we do this???
  const [filteredData, setFilteredData] = React.useState([]);
  const [pathList, setPathList] = React.useState([]);
  const [fetchData, setFetchData] = React.useState({
    trying: false,
    success: false,
    error: false,
  });
  const [sortDirection, setSortaDirection] = React.useState<"asc" | "dsc">(
    "dsc"
  );
  const [creatingSheet, setCreatingSheet] = React.useState({
    trying: false,
    success: false,
    error: false,
  });

  //TODO: fetch data
  const getSheets = async () => {
    //we start loading (trying) as soon as the user opens the page
    setFetchData({ trying: true, success: false, error: false });
    try {
      const allPaths = await api.getAllPaths();

      const metaObj = await api.getAllSheetMeta();
      const metaArray = Object.entries(metaObj);
      //if we have data set it and set loading to success

      console.log("allPaths => ", allPaths);
      console.log("metaArray => ", Object.entries(metaArray));
      //turn into something we can use for now
      const sheetList = structureJson1(metaArray);
      console.log("get sheetList success", sheetList);
      const orderedSheetList = sheetList.sort((a, b) => {
        //desc order
        return b.lastEdited - a.lastEdited;
      });
      //successfuly (success) got an answer, might or might not have data here
      setSheetList(orderedSheetList);
      //we need this to include our initial data
      setFilteredData(orderedSheetList);
      setFetchData({ trying: false, success: true, error: false });
      //update existing paths list
      setPathList(allPaths);
    } catch (e) {
      //something went wrong (error), this is an error state, no data
      console.log("Home => getSheets() error", e);
      setFetchData({ trying: false, success: false, error: true });
    }
  };
  React.useEffect(() => {
    //fetch our sheets (just one for now)
    getSheets();
  }, []);
  let navigate = useNavigate();
  const goToSheet = (path) => navigate("/apps/membrane/sheet" + path, {});

  const onAdd = async (title: string, path: string) => {
    //call api
    try {
      setCreatingSheet({ trying: true, success: false, error: false });
      const response = await api.createSheet(path, title);
      //if succesfull go ahead and fetch this new sheet using the path and append to our sheet list
      if (response) {
        const newSheet = await api.getSheetByPath(path);
        const newSheetList = cloneDeep(sheetList);
        newSheetList.unshift(structureJson(newSheet));

        let updatedPathList = [...pathList];
        updatedPathList.push(path);
        setSheetList(newSheetList);
        setFilteredData(newSheetList);
        setPathList(updatedPathList);
        //todo: update path list, include feedback
        setCreatingSheet({ trying: false, success: true, error: false });
        onAddDialogClose();
      } else {
        setCreatingSheet({ trying: false, success: false, error: true });
      }
      console.log("response", response);
    } catch (e) {
      setCreatingSheet({ trying: false, success: false, error: true });
    }
  };

  const [addDialogOpen, setAddDialogOpen] = React.useState<boolean>(false);
  const onAddDialogClose = () => {
    setAddDialogOpen(false);
  };
  const onAddDialogOpen = () => {
    setAddDialogOpen(true);
  };
  const onAddDialogUpdate = (title: string, path: string) => {
    onAdd(title, path);
  };
  const orderByDate = () => {
    //The sort() meth...returns the reference to the same array, now sorted
    //as to why we create a copy (a new array )^^
    const newSheetList = cloneDeep(filteredData);
    const results = newSheetList.sort((a, b) => {
      if (sortDirection === "dsc") return a.lastEdited - b.lastEdited;
      if (sortDirection === "asc") return b.lastEdited - a.lastEdited;
    });
    setSortaDirection(sortDirection === "asc" ? "dsc" : "asc");
    setFilteredData(results);
    return;
  };
  const renderGrid = () => {
    return (
      <>
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
              endIcon={
                sortDirection === "asc" ? (
                  <ArrowDropDownIcon />
                ) : (
                  <ArrowDropUpIcon />
                )
              }
              onClick={() => orderByDate()}
            >
              last edited
            </Button>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        <Divider light />
        <Box sx={{ paddingTop: 1 }}>
          <Stack justifyContent={"center"}>
            {filteredData.map((item, index) => {
              return (
                <SheetItem
                  key={index}
                  item={item}
                  sheetList={sheetList}
                  goToSheet={goToSheet}
                  pathList={pathList}
                  updateSheetList={(newSheetList) => {
                    setSheetList(newSheetList);
                    setFilteredData(newSheetList);
                  }}
                  updatePathList={setPathList}
                />
              );
            })}
          </Stack>
        </Box>
      </>
    );
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
          <SearchBar
            onSearch={(results) => {
              console.log("search results", results);
              setFilteredData(results);
            }}
            sheetList={sheetList}
          />
        </Box>
        {fetchData.trying && CircularIndeterminate()}
        {fetchData.success && renderGrid()}
        {fetchData.error && FailedToConnect(getSheets)}
      </Container>

      <AddDialog
        open={addDialogOpen}
        onConfirm={onAddDialogUpdate}
        onClose={onAddDialogClose}
        pathList={pathList}
        loading={creatingSheet.trying}
      />
    </>
  );
}

function AddDialog({ open, onConfirm, onClose, pathList, loading }) {
  const [titleInputValue, setTitleInputValue] = React.useState<string>("");
  const [pathInputValue, setPathInputValue] = React.useState<string>("");

  const [pathError, setPathError] = React.useState<boolean>(false);
  const [pathErrorMessage, setPathErrorMessage] = React.useState<string>("");
  const handleClose = () => {
    onClose();
  };
  const handleAdd = (event) => {
    //is the path url-safe?
    const matches = matchURLSafe(pathInputValue);
    //set error state if need be
    if (!matches) {
      setPathErrorMessage("Make sure the path is correctly formulated");
      setPathError(true);
      return;
    }
    //does the path already exist?
    if (pathList.includes(pathInputValue)) {
      setPathErrorMessage("This path already exists, try another one");
      setPathError(true);
      return;
    }
    setPathErrorMessage("");
    setPathError(false);
    //TODO: work around, eventually unmount this
    setTitleInputValue("");
    setPathInputValue("");

    onConfirm(titleInputValue, pathInputValue);
  };
  const handleTitleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTitleInputValue(event.target.value);
  };
  const handlePathInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPathInputValue(event.target.value);
    //make sure this string conforms to what we need
  };
  return (
    <Dialog fullWidth maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogTitle>Add a new sheet</DialogTitle>
      <DialogContent>
        {/*<DialogContentText>sheet title</DialogContentText>*/}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="title"
          type="text"
          variant="standard"
          value={titleInputValue}
          onChange={handleTitleInputChange}
          fullWidth
        />

        <TextField
          error={pathError}
          helperText={pathErrorMessage}
          autoFocus
          margin="dense"
          id="name"
          label="path"
          type="text"
          variant="standard"
          value={pathInputValue}
          onChange={handlePathInputChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          disabled={!(titleInputValue && pathInputValue)}
          onClick={handleAdd}
          loading={loading}
        >
          Add
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
