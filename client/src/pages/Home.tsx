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
import TuneIcon from "@mui/icons-material/Tune";
import InboxIcon from "@mui/icons-material/Inbox";
import { blue } from "@mui/material/colors";

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
import DialogContentText from "@mui/material/DialogContentText";
import Link from "@mui/material/Link";
import { StyledRoundButton } from "../components";
import { styled } from "@mui/material/styles";
import Autocomplete from "@mui/material/Autocomplete";

const NavigationButton = styled(Button)(({ theme }) => ({
  border: "1px solid #B3B3B3",
  color: theme.palette.text.primary,
  borderRadius: 10,
  marginLeft: theme.spacing(1),
  "&:hover": { borderColor: "#B3B3B3" },
  textTransform: "capitalize",
}));
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
  const [allTags, setAllTags] = React.useState(new Set());
  const [searchValue, setSearchValue] = React.useState("");
  const [filterTags, setFilterTags] = React.useState([]);
  const [pals, setPals] = React.useState([]);

  React.useEffect(() => {
    if (sheetList && sheetList.length > 0) {
      //everytime one of our dependencies change, we make sure to keep the dispaly up to date(filter, search, order...)
      let results = [];

      const newSheetList = cloneDeep(sheetList);
      //order sheets
      //The sort() meth...returns the reference to the same array, now sorted
      //as to why we create a copy (a new array )^^
      results = newSheetList.sort((a, b) => {
        if (sortDirection === "asc") return a.lastEdited - b.lastEdited;
        if (sortDirection === "dsc") return b.lastEdited - a.lastEdited;
      });
      //search by string if any
      if (searchValue) {
        results = results.filter((item) => {
          //does this sheet's title contain the search query? return boolean accordingly
          return item.title.toLowerCase().includes(searchValue.toLowerCase());
        });
      }
      //filter by tags if any
      if (filterTags && filterTags.length > 0) {
        results = results.filter((item) => {
          const tagsArray = item.tags.map((item) => item.label);
          return filterTags.some((item) => tagsArray.includes(item));
        });
      }
      //we always at least sort, so sheets are always available
      //update our state
      setFilteredData(results);
    }
  }, [searchValue, filterTags, sortDirection, sheetList]);

  const getTagsFromSheets = (sheetList = []) => {
    const allTags = sheetList
      .map((item) => item.tags.map((tag) => tag.label))
      .flat();

    const allTagsSet = new Set(allTags);
    return allTagsSet;
  };
  const getSheets = async () => {
    //we start loading (trying) as soon as the user opens the page
    setFetchData({ trying: true, success: false, error: false });
    try {
      const allPaths = await api.getAllPaths();

      const metaObj = await api.getAllSheetMeta();
      const metaArray = Object.entries(metaObj);
      //turn into something we can use for now
      const sheetList = structureJson1(metaArray);
      //a set off all the tags we have in our sheets
      const allTagsSet = getTagsFromSheets(sheetList);

      setAllTags(allTagsSet);
      //successfuly (success) got an answer, might or might not have data here
      setSheetList(sheetList);
      //we need this to include our initial data
      setFilteredData(sheetList);
      setFetchData({ trying: false, success: true, error: false });
      //update existing paths list
      setPathList(allPaths);
    } catch (e) {
      //something went wrong (error), this is an error state, no data
      console.log("Home => getSheets() error", e);
      setFetchData({ trying: false, success: false, error: true });
    }
  };
  const getPals = async () => {
    /*
     * we get the pals and save them to use as autocomplete values when sharing a sheet
     */
    try {
      const result = await api.getPals();
      console.log("getPals result => ", result);
      //we use outgoing(pals my ship trusts)
      if (result) {
        const newPals = Object.entries(result.outgoing).map(
          (item) => "~" + item[0]
        );
        setPals(newPals);
      }
    } catch (e) {
      console.log("getPals error =>", e);
    }
  };
  React.useEffect(() => {
    getSheets();
    getPals();
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
      console.log("create sheet response => ", response);
    } catch (e) {
      setCreatingSheet({ trying: false, success: false, error: true });
      console.log("create sheet error => ", e);
    }
  };
  const onFilterTags = (tags: []) => {
    setFilterTags(tags);
  };
  const [filterDialogOpen, setFilterDialogOpen] =
    React.useState<boolean>(false);
  const onFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };
  const onFilterDialogOpen = () => {
    setFilterDialogOpen(true);
  };
  const onFilterDialogUpdate = (tags: []) => {
    onFilterTags(tags);
    onFilterDialogClose();
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

  const renderGrid = () => {
    return (
      <Box sx={{ paddingTop: 1 }}>
        <Stack justifyContent={"center"}>
          {filteredData.map((item, index) => {
            return (
              <SheetItem
                key={index}
                item={item}
                pals={pals}
                sheetList={sheetList}
                goToSheet={goToSheet}
                pathList={pathList}
                updateSheetList={(newSheetList, tagsChanged = false) => {
                  if (tagsChanged) {
                    //use the newSheetList to get a new set of tags
                    const newTagsSet = getTagsFromSheets(newSheetList);
                    const newTagsArray = Array.from(newTagsSet);
                    //make sure all item in filterTagsexist in allTags
                    const newFilterTagsArray = Array.from(filterTags).filter(
                      (tag) => newTagsArray.includes(tag)
                    );
                    setFilterTags(newFilterTagsArray);
                    setAllTags(newTagsSet);
                  }
                  setSheetList(newSheetList);
                }}
                updatePathList={setPathList}
              />
            );
          })}
        </Stack>
      </Box>
    );
  };
  return (
    <>
      <Box
        sx={{
          backgroundColor: "lightgray",
          paddingTop: 1,
          paddingBottom: 1,
        }}
      >
        <Typography sx={{ textAlign: "center" }} variant="subtitle2">
          This is a Demo of the Membrane spreadsheet application, which is
          specified at{" "}
          <Link href="https://urbit.org/grants/membrane">
            https://urbit.org/grants/membrane
          </Link>
          . Features are still being added and can be tracked at
          <Link href="https://github.com/tiller-tolbus/membrane">
            {" "}
            https://github.com/tiller-tolbus/membrane
          </Link>
          . Do not store any important data here. Use for testing purposes only.
        </Typography>
      </Box>
      <Container fixed>
        <Box
          sx={{
            position: "sticky",
            backgroundColor: "white",
            top: 0,
            zIndex: 100, //to be over tooltips
            paddingTop: 4,
          }}
        >
          <Stack
            flexDirection={"row"}
            justifyContent="space-between"
            alignItems="center"
            sx={{ marginBottom: 5 }}
          >
            <NavigationButton
              size={"large"}
              variant="outlined"
              startIcon={<InboxIcon />}
              onClick={() => {
                navigate("/apps/membrane/invites");
              }}
            >
              invites
            </NavigationButton>
            <Stack
              flexDirection={"row"}
              justifyContent="center"
              alignItems="center"
            >
              {filterTags?.length > 0 ? (
                <StyledRoundButton
                  sx={{
                    marginRight: 2,
                    backgroundColor: filterTags?.length > 0 && blue[100],
                    borderColor: filterTags?.length > 0 && blue[700],
                  }}
                  aria-label="search"
                  onClick={() => onFilterDialogOpen()}
                >
                  <TuneIcon color={"primary"} />
                </StyledRoundButton>
              ) : (
                <StyledRoundButton
                  sx={{
                    marginRight: 2,
                  }}
                  aria-label="search"
                  onClick={() => onFilterDialogOpen()}
                >
                  <TuneIcon />
                </StyledRoundButton>
              )}
              <SearchBar
                onSearch={(searchValue) => {
                  setSearchValue(searchValue);
                }}
                sheetList={sheetList}
              />
            </Stack>
            <NavigationButton
              size={"large"}
              sx={{ visibility: "hidden" }}
              variant="outlined"
              startIcon={<InboxIcon />}
            >
              invites
            </NavigationButton>
          </Stack>
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
                onClick={() => {
                  setSortaDirection(sortDirection === "asc" ? "dsc" : "asc");
                }}
              >
                last edited
              </Button>
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
          <Divider light />
        </Box>
      </Container>

      <Container>
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
      <FilterDialog
        open={filterDialogOpen}
        onConfirm={onFilterDialogUpdate}
        onClose={onFilterDialogClose}
        tags={allTags}
        filterTags={filterTags}
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
      <DialogTitle>Add</DialogTitle>
      <DialogContent>
        <DialogContentText>Add a new sheet</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="title"
          type="text"
          value={titleInputValue}
          onChange={handleTitleInputChange}
          fullWidth
        />

        <TextField
          error={pathError}
          helperText={pathErrorMessage}
          margin="dense"
          id="name"
          label="/path"
          type="text"
          value={pathInputValue}
          onChange={handlePathInputChange}
          placeholder={"/path"}
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
function FilterDialog({ open, onConfirm, onClose, tags, filterTags }) {
  const [selectedTags, setSelectedTags] = React.useState(filterTags);
  React.useEffect(() => {
    setSelectedTags(filterTags);
  }, [filterTags]);
  const handleClose = () => {
    onClose();
  };
  const handleFilter = () => {
    onConfirm(selectedTags);
  };

  return (
    <Dialog fullWidth maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogTitle>Filter</DialogTitle>
      <DialogContent>
        <DialogContentText>Filter sheets by tags</DialogContentText>
        <Autocomplete
          sx={{ marginTop: 1 }}
          multiple
          id="filter-tags-input"
          options={Array.from(tags)}
          getOptionLabel={(option: any) => option}
          filterSelectedOptions
          onChange={(e, value) => setSelectedTags(value)}
          value={selectedTags}
          renderInput={(params) => (
            <TextField {...params} label="tags" placeholder="tag" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton onClick={handleFilter}>Save</LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
