import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

import Tooltip from "@mui/material/Tooltip";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Container from "@mui/material/Container";
import { blue } from "@mui/material/colors";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { useNavigate } from "react-router-dom";

const Item = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(["background", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  "&:hover": { background: blue[100], cursor: "pointer" },
}));
const data = [
  {
    title: "sheet 1",
    id: 1,
  },
  {
    title: "sheet 2",
    id: 2,
  },
  {
    title: "sheet 3",
    id: 3,
  },
  {
    title: "sheet 4",
    id: 4,
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
      <Fab
        sx={{ position: "fixed", right: 20, bottom: 20 }}
        color="primary"
        aria-label="add"
        onClick={() => onAddDialogOpen()}
      >
        <AddIcon />
      </Fab>
      <AddDialog
        open={addDialogOpen}
        onConfirm={onAddDialogUpdate}
        onClose={onAddDialogClose}
      />
      <Box>
        <Stack spacing={2}>
          {data.map((item, index) => {
            return (
              <Item key={index} variant="outlined" onClick={() => goToSheet()}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent={"space-between"}
                >
                  <Typography variant="h6" gutterBottom component="div">
                    {item.title}
                  </Typography>
                  <SheetMenu
                    onRename={onRename}
                    onDelete={onDelete}
                    onShare={onShare}
                    onAdd={onAdd}
                    sheetId={item.id}
                  />
                </Stack>
              </Item>
            );
          })}
        </Stack>
      </Box>
    </Container>
  );
}
function SheetMenu({ onRename, onDelete, onAdd, onShare, sheetId }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [renameDialogOpen, setRenameDialogOpen] =
    React.useState<boolean>(false);
  const [deletDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    //stop parent click from triggeing
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };
  const onRenameDialogOpen = () => {
    setRenameDialogOpen(true);
  };
  const onRenameDialogClose = () => {
    setRenameDialogOpen(false);
  };

  const onDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  const onDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  const onRenameDialogUpdate = (value: string) => {
    console.log("value", value);
    console.log("sheetId", sheetId);
    onRename(value, sheetId);
    onRenameDialogClose();
  };
  const onDeleteDialogUpdate = () => {
    console.log("delete this one =>", sheetId);
    onDelete();
    onDeleteDialogClose();
  };
  const [shareDialogOpen, setShareDialogOpen] = React.useState<boolean>(false);
  const onShareDialogClose = () => {
    setShareDialogOpen(false);
  };
  const onShareDialogOpen = () => {
    setShareDialogOpen(true);
  };
  const onShareDialogUpdate = (user: string) => {
    onShare(sheetId, user);
    onShareDialogClose();
  };

  return (
    <React.Fragment>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVertIcon>M</MoreVertIcon>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => onRenameDialogOpen()}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="medium" />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={() => onDeleteDialogOpen()}>
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Delete
        </MenuItem>
        <MenuItem onClick={() => onShareDialogOpen()}>
          <ListItemIcon>
            <PeopleAltOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Share with ur @pals
        </MenuItem>
      </Menu>
      <RenameDialog
        open={renameDialogOpen}
        onConfirm={onRenameDialogUpdate}
        onClose={onRenameDialogClose}
      />
      <DeleteDialog
        open={deletDialogOpen}
        onConfirm={onDeleteDialogUpdate}
        onClose={onDeleteDialogClose}
      />
      <ShareDialog
        open={shareDialogOpen}
        onConfirm={onShareDialogUpdate}
        onClose={onShareDialogClose}
      />
    </React.Fragment>
  );
}

function RenameDialog({ open, onConfirm, onClose }) {
  const [inputValue, setInputValue] = React.useState<string>("");
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
    >
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>
        <DialogContentText>rename this sheet</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          variant="standard"
          value={inputValue}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleRename}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}
function DeleteDialog({ open, onClose, onConfirm }) {
  const handleClose = () => {
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      onClick={(event) => event.stopPropagation()}
    >
      <DialogTitle id="alert-dialog-title">
        {"Confirm Deletion of this sheet"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          this action is irreversible
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={onConfirm}>Agree</Button>
      </DialogActions>
    </Dialog>
  );
}
function ShareDialog({ open, onConfirm, onClose }) {
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
    >
      <DialogTitle>Share with one of ur friends</DialogTitle>
      <DialogContent>
        <DialogContentText>enter their @p</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="@p"
          type="text"
          variant="standard"
          value={inputValue}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleShare}>Share</Button>
      </DialogActions>
    </Dialog>
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
    <Dialog open={open} onClose={handleClose}>
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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
